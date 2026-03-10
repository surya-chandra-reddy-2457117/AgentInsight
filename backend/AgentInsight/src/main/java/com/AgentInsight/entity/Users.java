package com.AgentInsight.entity;

import com.AgentInsight.CustomGenerator.GeneratedAgentId;
import com.AgentInsight.enums.UserRole;
import jakarta.persistence.*;

@Entity
public class Users {
//    @Id
//    private int id;
//    @Column(name="username")
//    private String username;
//    @Column(name="password")
//    private String password;

    @Id
    @GeneratedAgentId
    @Column(name="agentid")
    private String agentid;
    @Column(name="name")
    private String name;
    @Column(name="email")
    private String email;
    @Column(name="phone")
    private String phone;
    @Column(name="role")
    @Enumerated(EnumType.STRING)
    private UserRole role;
    @Column(name="password")
    private String password;

    public String getAgentId() {
        return agentid;
    }

    public void setAgentid(String agentid) {
        this.agentid = agentid;
    }



    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getUsername() {
        return name;
    }

    public void setUsername(String username) {
        this.name = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "Users{" +
                "agentid='" + agentid + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", role=" + role +
                ", password='" + password + '\'' +
                '}';
    }
}