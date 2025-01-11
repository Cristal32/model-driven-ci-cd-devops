# Springboot Backend web API

### Project structure
```
src/main/java/com/example/mde
├── controller
│   ├── ProjectController.java
│   └── TerraformController.java
├── model
│   ├── initConfig
│   ├── gitlab
│   └── terraform
├── service
│   ├── ProjectService.java
│   └── TerraformService.java
└── util
    ├── JsonToModel.java
    ├── InitConfigToGitlabTransformer.java
    ├── GitlabToYaml.java
    ├── JsonToTerraform.java
    └── TerraformGenerator.java
```

## Table of content

- [Requirements](#requirements)
- [Controller](#controller)
- [Model](#model)
- [Service](#service)
- [Util](#util)

## Requirements

The following JAR libraries are included in the project classpath:

- EMF Ecore (v2.38) [Maven](https://mvnrepository.com/artifact/org.eclipse.emf/org.eclipse.emf.ecore/2.38.0)
- EMF Common (v2.4) [Maven](https://mvnrepository.com/artifact/org.eclipse.emf/org.eclipse.emf.common/2.40.0)
- EMF XML/XMI Persistence (v2.38) [Maven](https://mvnrepository.com/artifact/org.eclipse.emf/org.eclipse.emf.ecore.xmi/2.38.0) 

## Controller

The ProjectController receives HTTP requests from the client (frontend) via the URI `/api/project`. 

POST `/upload`: 

1. Receives form data containing a MultipartFile (the .json initiConfig input)
2. Stores the input file in `uploads/project.json`
3. Calls executeTransformation(jsonPath) in the Service layer and receives Yaml path
4. If the Yaml file exists in that path, attaches it to the response to the client 

## Service

Serves as an intermediary to the Util script files that interact with the models. 

1. Executes JsonToModel.java
2. Executes InitConfigToGitLabTransformer.java
3. Executes GitlabToYaml.java
4. Returns the path to the generated gitlab yaml file

## Util

Contains the mentioned script files.

## Model

Contains the generated model files as Java classes.