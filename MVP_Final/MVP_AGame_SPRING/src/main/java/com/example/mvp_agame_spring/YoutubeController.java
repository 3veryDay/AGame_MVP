package com.example.mvp_agame_spring;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/youtube")
@RequiredArgsConstructor
public class YoutubeController {

    @Value("${youtube.api.key}")
    private String youtubeApiKey;

    @GetMapping("/search")
    public ResponseEntity<?> searchYoutube(@RequestParam String q,
                                           @RequestParam(required = false) String pageToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // 1. 검색
            String searchUrl = "https://www.googleapis.com/youtube/v3/search"
                    + "?part=snippet&type=video&maxResults=10"
                    + "&q=" + URLEncoder.encode(q, StandardCharsets.UTF_8)
                    + (pageToken != null ? "&pageToken=" + pageToken : "")
                    + "&key=" + youtubeApiKey;

            JsonNode searchResponse = new ObjectMapper()
                    .readTree(restTemplate.getForObject(searchUrl, String.class));

            // 2. videoId 목록 뽑기
            String videoIds = StreamSupport.stream(searchResponse.get("items").spliterator(), false)
                    .map(item -> item.get("id").get("videoId").asText())
                    .collect(Collectors.joining(","));

            // 3. 상세 정보 조회
            String detailsUrl = "https://www.googleapis.com/youtube/v3/videos"
                    + "?part=contentDetails"
                    + "&id=" + videoIds
                    + "&key=" + youtubeApiKey;

            JsonNode detailsResponse = new ObjectMapper()
                    .readTree(restTemplate.getForObject(detailsUrl, String.class));

            // 4. 필요하면 search + details 응답을 합쳐서 내려줌 (or 그냥 그대로 반환)
            ObjectNode result = new ObjectMapper().createObjectNode();
            result.set("search", searchResponse);
            result.set("details", detailsResponse);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("YouTube API 호출 실패: " + e.getMessage());
        }
    }
}