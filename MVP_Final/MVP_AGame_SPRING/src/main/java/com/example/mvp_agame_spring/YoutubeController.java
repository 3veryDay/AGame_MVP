package com.example.mvp_agame_spring;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
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
            ObjectMapper mapper = new ObjectMapper();

            // 1. YouTube 검색 API 호출
            String searchUrl = "https://www.googleapis.com/youtube/v3/search"
                    + "?part=snippet&type=video&maxResults=10"
                    + "&q=" + URLEncoder.encode(q, StandardCharsets.UTF_8)
                    + (pageToken != null ? "&pageToken=" + pageToken : "")
                    + "&key=" + youtubeApiKey;

            JsonNode searchResponse = mapper.readTree(restTemplate.getForObject(searchUrl, String.class));

            // 2. videoId 목록 추출
            String videoIds = StreamSupport.stream(searchResponse.get("items").spliterator(), false)
                    .map(item -> item.get("id").get("videoId").asText())
                    .collect(Collectors.joining(","));

            if (videoIds.isEmpty()) {
                ObjectNode result = mapper.createObjectNode();
                result.set("videos", mapper.createObjectNode());
                result.put("nextPageToken", "");
                return ResponseEntity.ok(result);
            }

            // 3. 영상 상세 정보 API 호출
            String detailsUrl = "https://www.googleapis.com/youtube/v3/videos"
                    + "?part=contentDetails"
                    + "&id=" + videoIds
                    + "&key=" + youtubeApiKey;

            JsonNode detailsResponse = mapper.readTree(restTemplate.getForObject(detailsUrl, String.class));

            // 4. 검색 정보 + 상세 정보 결합
            ArrayNode videoList = mapper.createArrayNode();
            for (int i = 0; i < searchResponse.get("items").size(); i++) {
                JsonNode searchItem = searchResponse.get("items").get(i);
                JsonNode detailItem = detailsResponse.get("items").get(i);

                ObjectNode video = mapper.createObjectNode();
                video.put("videoId", searchItem.get("id").get("videoId").asText());
                video.put("title", searchItem.get("snippet").get("title").asText());
                video.put("channel", searchItem.get("snippet").get("channelTitle").asText());
                video.put("thumbnail", searchItem.get("snippet").get("thumbnails").get("high").get("url").asText());
                video.put("duration", detailItem.get("contentDetails").get("duration").asText());

                videoList.add(video);
            }

            // 5. 결과 반환
            ObjectNode result = mapper.createObjectNode();
            result.set("videos", videoList);
            result.put("nextPageToken", searchResponse.has("nextPageToken")
                    ? searchResponse.get("nextPageToken").asText() : "");

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("YouTube API 호출 실패: " + e.getMessage());
        }
    }
}
