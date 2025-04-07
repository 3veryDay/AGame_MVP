package com.example.mvp_agame_spring;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Controller
@RequestMapping("/api/spotify/music")
@RequiredArgsConstructor
public class SpotifyMusicController {



    @PutMapping("/play")
    public ResponseEntity<?> playTrack (
            @RequestBody Map<String, String> payload,
            HttpSession session
            ) {
        String accessToken = (String) session.getAttribute("accessToken");
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "no access token"));
        }

        String deviceId = payload.get("device_id");
        String trackUri = payload.get("track_uri");

        if (deviceId==null || trackUri ==null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "missing device_id or track_uri"));
        }
        try{
            String jsonbody = String.format("{\"uris\" : [\"%s\"]}", trackUri);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.spotify.com/v1/me/player/play?device_id=" + deviceId))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json")
                    .PUT(HttpRequest.BodyPublishers.ofString(jsonbody))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return ResponseEntity.status(response.statusCode())
                    .body(Map.of("status", "Track Played", "response", response.body()));

            }catch(Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    // 특정 키워드로 음원 찾기
    @GetMapping("/search")
    public ResponseEntity<?> searchSpotify (
            @RequestParam String type,
            @RequestParam String q,
            HttpSession session
    ) {
        String accessToken = (String) session.getAttribute("accessToken");

        if (accessToken == null ) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "no access Token"));

        }

        try {
            String url = String.format("https://api.spotify.com/v1/search?q=%s&type=%s&limit=10",
                    URLEncoder.encode(q, StandardCharsets.UTF_8),
                    URLEncoder.encode(type, StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + accessToken)
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("🎧 응답 body: " + response.body());

            if (response.body() == null || response.body().isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Empty response from Spotify"));
            }

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> json = objectMapper.readValue(response.body(), new TypeReference<>() {});
            return ResponseEntity.ok(json);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }

    }

    @GetMapping("/top-tracks")
    public ResponseEntity<?> getTopTracks(HttpSession session) {
        String accessToken = (String) session.getAttribute("accessToken");
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No access token"));
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.spotify.com/v1/me/top/tracks?limit=10"))
                    .header("Authorization", "Bearer " + accessToken)
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> json = objectMapper.readValue(response.body(), new TypeReference<>() {});
            return ResponseEntity.ok(json);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/global-chart")
    public ResponseEntity<?> getGlobalChart(HttpSession session) {
        String accessToken = (String) session.getAttribute("accessToken");
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No access token"));
        }

        try {
            String playlistId = "37i9dQZEVXbMDoHDwVN2tF"; // ✅ 정확한 ID
            String url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";

            System.out.println("🎯 요청 URL: " + url);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + accessToken)
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> json = objectMapper.readValue(response.body(), new TypeReference<>() {});
            return ResponseEntity.ok(json);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }


}
