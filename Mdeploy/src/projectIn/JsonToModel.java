package projectIn;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.xmi.impl.XMIResourceFactoryImpl;

import InitConfig.*; // Import your generated EMF classes.

import java.io.File;
import java.util.List;

public class JsonToModel {
    public static void main(String[] args) throws Exception {
        // Parse JSON
        ObjectMapper mapper = new ObjectMapper();
        ProjectJson projectData = mapper.readValue(new File("project.json"), ProjectJson.class);

        // Create EMF model instances
        InitConfigFactory factory = InitConfigFactory.eINSTANCE;

        // Create Project
        Project project = factory.createProject();
        project.setName(projectData.getName());
        project.setUrl(projectData.getUrl());
        project.setBranch(projectData.getBranch());

        // Create Build configurations
        for (BuildJson buildData : projectData.getBuildConfigs()) {
            Build build = factory.createBuild();
            build.setTool(buildData.getTool());
            build.setCmd(buildData.getCmd());
            build.setParams(buildData.getParams());
            
            // Establish bidirectional relationship
            build.setProject(project);
            project.getBuildconfigs().add(build);
        }

        // Create Tests
        for (TestJson testData : projectData.getTestJson()) {
            Test test = factory.createTest();
            test.setName(testData.getName());
            test.setType(testData.getType());
            test.setCmd(testData.getCmd());
            test.setStatus(testData.getStatus());
            
            // Establish bidirectional relationship
            test.setProject(project);
            project.getTests().add(test);
        }

        // Create Deploy configurations
        for (DeployJson deployData : projectData.getDeployConfigs()) {
            Deploy deploy = factory.createDeploy();
            deploy.setCmd(deployData.getCmd());
            
            // Establish bidirectional relationship
            deploy.setProject(project);
            project.getDeployconfigs().add(deploy);
        }

        // Print the model for validation
        printProjectModel(project);

        // Save to XMI file
        saveModelToXMI(project);
    }

    private static void saveModelToXMI(Project project) throws Exception {
        // Register the XMI resource factory
        Resource.Factory.Registry reg = Resource.Factory.Registry.INSTANCE;
        reg.getExtensionToFactoryMap().put("xmi", new XMIResourceFactoryImpl());

        // Create a ResourceSet
        ResourceSetImpl resSet = new ResourceSetImpl();

        // Create a Resource for saving the model to an XMI file
        Resource resource = resSet.createResource(URI.createFileURI("project.xmi"));

        // Add the Project model to the resource
        resource.getContents().add(project);

        // Save the resource to the XMI file
        resource.save(null);  // Pass 'null' for options, or use a map for specific options
        System.out.println("Model saved to project.xmi");
    }

    private static void printProjectModel(Project project) {
        System.out.println("Project: " + project.getName());
        System.out.println("URL: " + project.getUrl());
        System.out.println("Branch: " + project.getBranch());

        System.out.println("Build Configurations:");
        for (Build build : project.getBuildconfigs()) {
            System.out.println("  Tool: " + build.getTool());
            System.out.println("  Command: " + build.getCmd());
            System.out.println("  Params: " + build.getParams());
        }

        System.out.println("Tests:");
        for (Test test : project.getTests()) {
            System.out.println("  Test Name: " + test.getName());
            System.out.println("  Type: " + test.getType());
            System.out.println("  Command: " + test.getCmd());
            System.out.println("  Status: " + test.getStatus());
        }

        System.out.println("Deploy Configurations:");
        for (Deploy deploy : project.getDeployconfigs()) {
            System.out.println("  Command: " + deploy.getCmd());
        }
    }
}

// JSON Helper Classes
class ProjectJson {
    private String name;
    private String url;
    private String branch;

    @JsonProperty("buildconfigs")
    private List<BuildJson> buildconfigs;

    @JsonProperty("tests")
    private List<TestJson> tests;

    @JsonProperty("deployconfigs")
    private List<DeployJson> deployconfigs;

    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public List<BuildJson> getBuildConfigs() { return buildconfigs; }
    public void setBuildConfigs(List<BuildJson> buildconfigs) { this.buildconfigs = buildconfigs; }

    public List<TestJson> getTestJson() { return tests; }
    public void setTestJson(List<TestJson> tests) { this.tests = tests; }

    public List<DeployJson> getDeployConfigs() { return deployconfigs; }
    public void setDeployConfigs(List<DeployJson> deployconfigs) { this.deployconfigs = deployconfigs; }
}

class BuildJson {
    private String tool;
    private String cmd;
    private String params;

    // Getters and setters
    public String getTool() { return tool; }
    public void setTool(String tool) { this.tool = tool; }

    public String getCmd() { return cmd; }
    public void setCmd(String cmd) { this.cmd = cmd; }

    public String getParams() { return params; }
    public void setParams(String params) { this.params = params; }
}

class TestJson {
    private String name;
    private String type;
    private String cmd;
    private int status;

    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCmd() { return cmd; }
    public void setCmd(String cmd) { this.cmd = cmd; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
}

class DeployJson {
    private String cmd;

    // Getters and setters
    public String getCmd() { return cmd; }
    public void setCmd(String cmd) { this.cmd = cmd; }
}