package com.AgentInsight.service.Impl;

import com.AgentInsight.CustomException.EmailAlreadyExistsException;
import com.AgentInsight.dto.AgentPerformanceDTO;
import com.AgentInsight.dto.AgentReportDTO;
import com.AgentInsight.dto.IncentiveDto;
import com.AgentInsight.dto.UserDto;
import com.AgentInsight.entity.Incentive;
import com.AgentInsight.entity.Sales;
import com.AgentInsight.entity.UserPrincipal;
import com.AgentInsight.entity.Users;

import com.AgentInsight.enums.UserRole;
import com.AgentInsight.repository.IncentiveRepository;
import com.AgentInsight.repository.SalesRepository;
import com.AgentInsight.repository.UserRepository;
import com.AgentInsight.security.JWTUtil;
import com.AgentInsight.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
public class UserServiceImpl implements UserDetailsService, UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SalesRepository salesRepository;
    @Autowired
    private IncentiveRepository incentiveRepository;


    @Autowired
    private JWTUtil jwtService;

    @Autowired
    @Lazy
    private AuthenticationManager authManager;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Change findByUsername to findByEmail
        Users user = userRepository.findByEmail(email);

        if (user == null) {
            System.out.print("No user found with email: " + email);
            throw new UsernameNotFoundException("User not found");
        }
        return new UserPrincipal(user);
    }

    @Override
    public void addUser(Users user){

        if(userRepository.existsByEmail(user.getEmail())){
            throw new EmailAlreadyExistsException("An Account with email: "+user.getEmail()+" Exists");
        }


        user.setRole(UserRole.AGENT);
        userRepository.save(user);
    }

    @Override
    public List<UserDto> getAllUsers(){
        return userRepository.findAll().stream()
                .map(user -> new UserDto(user.getAgentId(), user.getName(), user.getEmail(),
                        user.getPhone(), user.getRole()))
                .collect(Collectors.toList());
    }

    @Override
    public Map<String,String> verify(Users user) {
        Users existingUser = userRepository.findByEmail(user.getEmail());
        Map<String,String> response = new HashMap<>();

        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );

            if (authentication.isAuthenticated()) {
                String token = jwtService.generateToken(user.getEmail(), existingUser.getRole());
                response.put("token", token);
                response.put("message", "Login Successful");
                response.put("role",existingUser.getRole().toString());
                response.put("agentid", existingUser.getAgentId());
                response.put("agentname",existingUser.getName());
                response.put("phoneno",existingUser.getPhone());
                return response;
            }
        } catch (org.springframework.security.core.AuthenticationException e) {
            response.put("error", "Login Failed");
            return response;
        }

        response.put("error", "Login Failed");
        return response;
    }


    @Override
    @Transactional
    public void deleteUser(String agentid) {
        if (userRepository.existsById(agentid)) {
            userRepository.deleteById(agentid);
        } else {
            throw new RuntimeException("Agent not found with ID: " + agentid);
        }
    }


    @Override
    public UserDto getUserById(String agentid) {
        Users user = userRepository.findById(agentid).orElseThrow(() -> new RuntimeException("User not found"));
        return new UserDto(user.getAgentId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    @Override
    public Users createUser(Users user) {  // <--- CHANGE return type
        return userRepository.save(user);  // <--- ADD 'return' keyword
    }


    @Override
    public void updateUser(String agentid, Users updatedUser) {
        Users existingUser = userRepository.findById(agentid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedUser.getName() != null) {
            existingUser.setName(updatedUser.getName());
        }
        if (updatedUser.getEmail() != null) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPhone() != null) {
            existingUser.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            // Optional: encode password if using Spring Security
             existingUser.setPassword(updatedUser.getPassword());
        }

        userRepository.save(existingUser);
    }

    // com.AgentInsight.service.Impl.UserServiceImpl.java
    @Override
    public List<AgentReportDTO> getAgentReport() {
        return userRepository.getAgentPerformanceReport();
    }

    @Override
    public AgentPerformanceDTO getAgentPerformanceById(String agentid) {
        Users user = userRepository.findById(agentid)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        // Fetch lists and handle potential nulls from repository
        List<Sales> sales = salesRepository.findByAgentid(agentid);
        if (sales == null) {
            sales = java.util.Collections.emptyList();
        }

        List<Incentive> incentives = incentiveRepository.findByAgentid(agentid);
        if (incentives == null) {
            incentives = java.util.Collections.emptyList();
        }

        // Safely calculate total sales (checking for null saleamount)
        double totalSales = sales.stream()
                .filter(s -> s.getSaleamount() != null)
                .mapToDouble(Sales::getSaleamount)
                .sum();

        // Convert incentives to DTOs
        List<IncentiveDto> incentiveDtos = mapIncentivesToDto(incentives);

        // Safely calculate total incentives (checking for null amount)
        double totalIncentives = incentiveDtos.stream()
                .filter(i -> i.getAmount() != null)
                .mapToDouble(IncentiveDto::getAmount)
                .sum();

        return new AgentPerformanceDTO(
                user.getAgentId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                sales,
                incentiveDtos,
                totalSales,
                totalIncentives
        );
    }

    private List<IncentiveDto> mapIncentivesToDto(List<Incentive> incentives) {
        return incentives.stream()
                .map(incentive -> new IncentiveDto(
                        incentive.getIncentiveid(),
                        incentive.getAgentid(),
                        incentive.getAmount(),
                        incentive.getCalculationdate(),
                        incentive.getStatus()
                ))
                .collect(Collectors.toList());
    }


}