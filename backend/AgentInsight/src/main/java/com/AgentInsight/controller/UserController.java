package com.AgentInsight.controller;

import com.AgentInsight.CustomException.EmailAlreadyExistsException;
import com.AgentInsight.dto.UserDto;
import com.AgentInsight.entity.Users;
import com.AgentInsight.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String,String>> register(@RequestBody Users user) {
        try {
            userService.addUser(user);
            Map<String,String> response=new HashMap<>();
            response.put("w4", "User registered successfully");
            response.put("status", "success");
            response.put("role", user.getRole().name());
            return ResponseEntity.ok(response);
        } catch (EmailAlreadyExistsException e){
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            error.put("status","Error registering");
            return ResponseEntity.badRequest().body(error);
        }
        catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Registration failed ");
            error.put("status", "error");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String,String>> createAgent(@RequestBody Users user) {
        try {
            if (user.getAgentId() != null && user.getAgentId().trim().isEmpty()) {
                user.setAgentid(null);
            }
            Users savedUser = userService.createUser(user);

            Map<String,String> response = new HashMap<>();
            response.put("message", "Agent created successfully");
            response.put("status", "success");
            response.put("role", savedUser.getRole().name());
            response.put("agentid", savedUser.getAgentId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Keep this for server logs
            Map<String, String> error = new HashMap<>();
            // CHANGE: Don't send e.getMessage() to the client
            error.put("message", "Failed to create agent. Please check your input.");
            error.put("status", "error");
            return ResponseEntity.badRequest().body(error);
        }
    }




    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Users user) {
        System.out.print("Inside login");

        Map<String,String> token = userService.verify(user);
        System.out.println(token);

        if (!"failes".equals(token)) {
            // Map<String, String> response = new HashMap<>(); // Unused variable
            return ResponseEntity.ok(token);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("error", "Invalid credentials"));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/{agentid}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String agentid) { // Change return type
        try {
            userService.deleteUser(agentid);

            // Return JSON instead of plain string
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            response.put("status", "success");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Deletion failed: " + e.getMessage());
            error.put("status", "error");
            return ResponseEntity.badRequest().body(error);
        }
    }


    // --- FIX APPLIED HERE ---
    @PatchMapping("/{agentid}")
    public ResponseEntity<?> updateUser(@PathVariable String agentid, @RequestBody Users user) {
        try {
            // 1. Perform the update
            userService.updateUser(agentid, user);

            // 2. Fetch the updated user DTO to return to the frontend
            // This satisfies the frontend check: if (!savedAgent || !savedAgent.agentid)
            UserDto updatedUser = userService.getUserById(agentid);

            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Update failed: " + e.getMessage());
        }
    }

    @GetMapping("/{agentid}")
    public ResponseEntity<UserDto> getUserById(@PathVariable String agentid) {
        try {
            UserDto userDto = userService.getUserById(agentid);
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
