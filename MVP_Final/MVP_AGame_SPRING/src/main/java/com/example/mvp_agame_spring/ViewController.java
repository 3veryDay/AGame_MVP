package com.example.mvp_agame_spring;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ViewController {
    @RequestMapping(value = "/{path:^(?!api).*$}")
    public String forward() {
        return "forward:/index.html";
    }
}