package com.AgentInsight.controller;

import com.AgentInsight.dto.UserDto;
import com.AgentInsight.entity.Users;
import com.AgentInsight.enums.UserRole;
import com.AgentInsight.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/agent")

public class AgentController {

    private final UserService userService;


    public AgentController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/loadagents")
    public ResponseEntity<List<UserDto>> getAllAgents() {
        List<UserDto> users = userService.getAllUsers();

        // Filter only AGENT role
        List<UserDto> agents = users.stream()
                .filter(user -> user.getRole() == UserRole.AGENT)
                .collect(Collectors.toList());

        return ResponseEntity.ok(agents);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/addagent")
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

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/update/{agentid}")
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


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{agentid}")
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
}
