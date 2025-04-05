package com.example.mvp_agame_spring;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
/*
📌 엔드포인트 요약
메서드	URL	설명
GET	    /spotify/playback/track-info?trackUri=spotify:track:...	곡 정보 가져오기
PUT	    /spotify/playback/play	    곡 재생
PUT	    /spotify/playback/pause	    일시 정지
POST	/spotify/playback/next	    다음 트랙
POST	/spotify/playback/previous  이전 트랙
 */
@RestController
@RequestMapping("/spotify/playback")
public class SpotifyPlaybackController {

    @GetMapping("/track-info")
    public ResponseEntity<?> getTrackInfo(@RequestParam String trackUri, HttpSession session) {
        String accessToken = (String) session.getAttribute("accessToken");
        if (accessToken == null) return unauthorized();

        try {
            String trackId = trackUri.replace("spotify:track:", "");
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.spotify.com/v1/tracks/" + trackId))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return ResponseEntity.status(response.statusCode())
                    .body(response.body());
        } catch (Exception e) {
            return error(e);
        }
    }

    @PutMapping("/play")
    public ResponseEntity<?> play(@RequestBody Map<String, String> payload, HttpSession session) {
        return sendPlaybackRequest("play", payload, session);
    }

    @PutMapping("/pause")
    public ResponseEntity<?> pause(HttpSession session) {
        return sendPlaybackRequest("pause", null, session);
    }

    @PostMapping("/next")
    public ResponseEntity<?> next(HttpSession session) {
        return sendPlaybackRequest("next", null, session);
    }

    @PostMapping("/previous")
    public ResponseEntity<?> previous(HttpSession session) {
        return sendPlaybackRequest("previous", null, session);
    }

    // ================== 공통 유틸 ==================

    private ResponseEntity<?> sendPlaybackRequest(String action, Map<String, String> payload, HttpSession session) {
        String accessToken = (String) session.getAttribute("accessToken");
        if (accessToken == null) return unauthorized();

        try {
            String deviceId = payload != null ? payload.get("device_id") : null;
            String trackUri = payload != null ? payload.get("track_uri") : null;

            String uri = "https://api.spotify.com/v1/me/player/" + action;
            if (deviceId != null) uri += "?device_id=" + deviceId;

            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(uri))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json");

            if ("play".equals(action) && trackUri != null) {
                String json = String.format("{\"uris\": [\"%s\"]}", trackUri);
                builder.PUT(HttpRequest.BodyPublishers.ofString(json));
            } else {
                builder.method("PUT", HttpRequest.BodyPublishers.noBody());
            }

            HttpRequest request = builder.build();
            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return ResponseEntity.status(response.statusCode())
                    .body(Map.of("status", action + " 성공", "response", response.body()));

        } catch (Exception e) {
            return error(e);
        }
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "No access token"));
    }

    private ResponseEntity<?> error(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
    }
}
