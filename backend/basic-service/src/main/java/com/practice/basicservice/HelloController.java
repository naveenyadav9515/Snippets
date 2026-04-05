package com.practice.basicservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allows React/Angular to access it via gateway or directly
public class HelloController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello World from Enterprise Microservice!";
    }
}
