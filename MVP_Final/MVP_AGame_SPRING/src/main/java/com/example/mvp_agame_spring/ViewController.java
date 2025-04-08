package com.example.mvp_agame_spring;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ViewController {

    @RequestMapping(value = {
            "/", "/menu", "/dashboard", "/interval", "/interval-entry", "/interval3", "/login"
    })
    public String forward(HttpServletRequest request) {
        String uri = request.getRequestURI();

        // /api로 시작하면 무시 (Spring이 처리)
        if (uri.startsWith("/api") || uri.startsWith("/static") || uri.startsWith("/index.html")) {
            return null;
        }

        return "forward:/index.html";
    }
}
