package com.example.mvp_agame_spring;

// src/main/java/your/package/config/WebConfig.java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer{


    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://13.209.50.203:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Set-Cookie", "Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }

    // ✅ 여기에 api 경로 제외하도록 수정
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{spring:[\\w\\-]+}")
                .setViewName("forward:/index.html");
        registry.addViewController("/**/{spring:[\\w\\-]+}")
                .setViewName("forward:/index.html");
        registry.addViewController("/{spring:[\\w\\-]+}/**{spring:[\\w\\-]+}")
                .setViewName("forward:/index.html");
    }
}

/*
.allowedOrigins("https://your-frontend.com") // 정확한 도메인 지정
.allowedMethods("GET", "POST") // 정말 필요한 메서드만
.allowedHeaders("Content-Type", "Authorization") // 필요한 헤더만
.addMapping("/api/**") // API 경로만 허용
 */