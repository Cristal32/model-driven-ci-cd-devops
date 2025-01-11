package com.example.mde.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.example.mde.service.ProjectService;

@RestController
@CrossOrigin(origins = "http://localhost:3000/")
@RequestMapping("/api/project")
public class ProjectController {

	private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

 // Endpoint to receive and store the JSON file
    @PostMapping("/upload")
    public ResponseEntity<?> uploadJsonFile(@RequestParam("file") MultipartFile file) {
        try {
            // Define the path where the file will be saved
        	String uploadDir = System.getProperty("user.dir") + "/uploads";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs(); // Create directory if it does not exist
            }

            // Create the file on the server
            File jsonFile = new File(uploadDir + File.separator + "project.json");
            file.transferTo(jsonFile);

            // Call the service to execute the transformation
            String yamlPath = projectService.executeTransformation(jsonFile.getAbsolutePath());

            if (yamlPath != null) {
                // Read the generated YAML file
                File yamlFile = new File(yamlPath);
                if (yamlFile.exists()) {
                    return ResponseEntity.ok()
                            .header("Content-Disposition", "attachment; filename=gitlab-ci.yml")
                            .body(Files.readAllBytes(yamlFile.toPath()));
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("YAML file not generated.");
                }
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error during transformation process.");
            }
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file: " + e.getMessage());
        }
    }
}
