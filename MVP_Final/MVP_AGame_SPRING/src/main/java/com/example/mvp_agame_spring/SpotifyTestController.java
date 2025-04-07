// ✅ SpotifyTestController.java
package com.example.mvp_agame_spring;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import se.michaelthelin.spotify.SpotifyApi;
import se.michaelthelin.spotify.exceptions.detailed.ForbiddenException;
import se.michaelthelin.spotify.model_objects.credentials.AuthorizationCodeCredentials;
import se.michaelthelin.spotify.model_objects.specification.User;
import se.michaelthelin.spotify.requests.authorization.authorization_code.AuthorizationCodeRequest;
import se.michaelthelin.spotify.requests.authorization.authorization_code.AuthorizationCodeUriRequest;
import se.michaelthelin.spotify.requests.data.users_profile.GetCurrentUsersProfileRequest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Controller
@RequestMapping("/api/spotify")
@RequiredArgsConstructor
public class SpotifyTestController {

    @Value("${frontend.redirectUri}")
    private String frontendRedirectUri;

    @Value("${spotify.client.id}")
    private String clientId;

    @Value("${spotify.client.secret.id}")
    private String clientSecret;

    @Value("${spotify.redirectUri}")
    private String redirectUri;

    @GetMapping("/login")
    public ResponseEntity<String> login() {
        SpotifyApi apiForLogin = new SpotifyApi.Builder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRedirectUri(URI.create(redirectUri))
                .build();
        //playlist-read-private
        //playlist-read-collaborative
        //user-modify-playback-state
        //user-read-playback-state
        //streaming

        AuthorizationCodeUriRequest authorizationCodeUriRequest = apiForLogin.authorizationCodeUri()
                .scope("user-read-private user-read-email streaming user-read-playback-state " +
                        "user-read-recently-played user-modify-playback-state user-read-currently-playing " +
                        "playlist-read-private playlist-read-collaborative streaming")
                .show_dialog(true)
                .build();

        URI uri = authorizationCodeUriRequest.execute();
        System.out.println("🔗 로그인 URL: " + uri);

        return ResponseEntity.status(HttpStatus.FOUND).location(uri).build();
    }

    @GetMapping("/callback")
    public ResponseEntity<String> callback(@RequestParam(value = "code", required = false) String code, HttpSession session) {
        if (code == null || code.isEmpty()) {
            System.out.println("🚨 잘못된 접근 - code 없음");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("잘못된 인증 요청입니다.");
        }

        SpotifyApi api = new SpotifyApi.Builder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRedirectUri(URI.create(redirectUri))
                .build();

        try {
            AuthorizationCodeRequest request = api.authorizationCode(code).build();
            AuthorizationCodeCredentials credentials = request.execute();

            String accessToken = credentials.getAccessToken();
            session.setAttribute("accessToken", accessToken);
            System.out.println("✅ accessToken 저장됨: " + accessToken);
            System.out.println("🔍 Granted scopes: " + credentials.getScope());

            // ✅ 리디렉션 (code 제거된 상태)
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendRedirectUri)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("서버 에러: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }

    @GetMapping("/token")
    public ResponseEntity<?> getToken(HttpSession session) {
        String accessToken = (String) session.getAttribute("accessToken");
        /*
        여기서 더해야 하는건지...?
         */

        //String refreshToken = (String) session.getAttribute("refreshToken");
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "no Access Token"));
        }
        return ResponseEntity.ok(Map.of("accessToken", accessToken));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile(HttpSession session) {
        String accessToken = (String) session.getAttribute("accessToken");
        System.out.println("/me 요청 - accessToken: " + accessToken);

        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "no Access Token"));
        }

        SpotifyApi api = new SpotifyApi.Builder()
                .setAccessToken(accessToken)
                .build();

        try {
            final GetCurrentUsersProfileRequest getCurrentUsersProfileRequest = api.getCurrentUsersProfile().build();
            final User user = getCurrentUsersProfileRequest.execute();

            Map<String, Object> userInfo = Map.of(
                    "id", user.getId(),
                    "display_name", user.getDisplayName(),
                    "email", user.getEmail()
            );

            return ResponseEntity.ok(userInfo);
        } catch (ForbiddenException e) {
            System.out.println("❌ 프리미엄 계정 아님 (403)");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "403 - Premium required"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getSpotifyProfile(HttpSession session) {
        String accessToken = (String) session.getAttribute("accessToken");
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "no Access Token"));
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.spotify.com/v1/me"))
                    .header("Authorization", "Bearer " + accessToken)
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return ResponseEntity.status(response.statusCode())
                    .body(response.body());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        System.out.println("✅ 세션 로그아웃 완료");
        return ResponseEntity.ok().build();
    }
}
