import React, { useState } from "react";
import "./Form.css";
import "./Form.css";

const Form = () => {
  const [currentForm, setCurrentForm] = useState("projectInit");
  
  // Project Init Form State
  const [projectFormData, setProjectFormData] = useState({
    name: "",
    url: "",
    branch: "",
    build: [],
    tests: [],
    deploy: []
  });

  // Terraform Form State
  const [terraformFormData, setTerraformFormData] = useState({
    providers: [],
    resources: [],
    variables: [],
    outputs: []
  });

  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [jsonPreview, setJsonPreview] = useState("");

  // Project Init Form Handlers
  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProjectAddConfig = (type) => {
    setProjectFormData(prev => ({
      ...prev,
      [type]: [
        ...prev[type],
        type === "tests"
          ? { name: "", type: "", cmd: "", status: "" }
          : { name: "", cmd: "", params: type === "build" ? "" : undefined }
      ]
    }));
  };

  const handleProjectConfigChange = (type, index, field, value) => {
    setProjectFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleProjectDeleteConfig = (type, index) => {
    setProjectFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // Terraform Form Handlers
  const handleTerraformAddItem = (section) => {
    setTerraformFormData(prev => ({
      ...prev,
      [section]: [...prev[section],
        section === 'resources' ? {
          name: '',
          type: '',
          attributes: []
        } : section === 'variables' ? {
          name: '',
          type: ''
        } : section === 'providers' ? {
          name: '',
          version: '',
          attributes: []
        } : {
          name: '',
          value: ''
        }
      ]
    }));
  };

  const handleTerraformItemChange = (section, index, field, value) => {
    setTerraformFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleTerraformDeleteItem = (section, index) => {
    setTerraformFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleTerraformAddAttribute = (section, itemIndex) => {
    setTerraformFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, index) => {
        if (index === itemIndex) {
          return {
            ...item,
            attributes: [...(item.attributes || []), { key: '', value: '' }]
          };
        }
        return item;
      })
    }));
  };

  const handleTerraformAttributeChange = (section, itemIndex, attrIndex, field, value) => {
    setTerraformFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, index) => {
        if (index === itemIndex) {
          const newAttributes = [...item.attributes];
          newAttributes[attrIndex] = {
            ...newAttributes[attrIndex],
            [field]: value
          };
          return { ...item, attributes: newAttributes };
        }
        return item;
      })
    }));
  };

  const handleTerraformDeleteAttribute = (section, itemIndex, attrIndex) => {
    setTerraformFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, index) => {
        if (index === itemIndex) {
          return {
            ...item,
            attributes: item.attributes.filter((_, i) => i !== attrIndex)
          };
        }
        return item;
      })
    }));
  };

  // Submit Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = currentForm === "projectInit" ? projectFormData : terraformFormData;
    setJsonPreview(JSON.stringify(formData, null, 2));
    setShowJsonPreview(true);
  };

  const handleConfirmSubmit = () => {
    const formData = currentForm === "projectInit" ? projectFormData : terraformFormData;
    const jsonBlob = new Blob([JSON.stringify(formData)], { type: "application/json" });
    const formDataToSend = new FormData();
    const endpoint = currentForm === "projectInit" 
      ? "http://localhost:8089/api/project/upload"
      : "http://localhost:8089/api/terraform/upload";
    const filename = currentForm === "projectInit" ? "project.yaml" : "main.tf";
    
    formDataToSend.append("file", jsonBlob, `${currentForm}.json`);

    fetch(endpoint, {
      method: "POST",
      body: formDataToSend,
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to generate file");
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        alert(`${filename} generated and downloaded!`);
      })
      .catch(error => {
        console.error("Error:", error);
        alert(`Error generating or downloading ${filename}`);
      });
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <button
          className={`nav-btn ${currentForm === "projectInit" ? "active" : ""}`}
          onClick={() => setCurrentForm("projectInit")}
        >
          Project Initialization
        </button>
        <button
          className={`nav-btn ${currentForm === "terraform" ? "active" : ""}`}
          onClick={() => setCurrentForm("terraform")}
        >
          Terraform Configuration
        </button>
      </nav>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {currentForm === "projectInit" ? (
            // Project Init Form
            <div className="project-init-form">
              <h2 className="section-title">Project Details</h2>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Project Name"
                  value={projectFormData.name}
                  onChange={handleProjectChange}
                  className="form-input"
                />
                <input
                  type="text"
                  name="url"
                  placeholder="Project URL"
                  value={projectFormData.url}
                  onChange={handleProjectChange}
                  className="form-input"
                />
                <input
                  type="text"
                  name="branch"
                  placeholder="Branch"
                  value={projectFormData.branch}
                  onChange={handleProjectChange}
                  className="form-input"
                />
              </div>

              {/* Build Section */}
              <h3 className="section-title">Build Configurations</h3>
              {projectFormData.build.map((build, index) => (
                <div key={index} className="config-item">
                  <input
                    type="text"
                    placeholder="Build Name"
                    value={build.name}
                    onChange={(e) => handleProjectConfigChange("build", index, "name", e.target.value)}
                    className="config-input"
                  />
                  <input
                    type="text"
                    placeholder="Command"
                    value={build.cmd}
                    onChange={(e) => handleProjectConfigChange("build", index, "cmd", e.target.value)}
                    className="config-input"
                  />
                  <input
                    type="text"
                    placeholder="Parameters"
                    value={build.params}
                    onChange={(e) => handleProjectConfigChange("build", index, "params", e.target.value)}
                    className="config-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleProjectDeleteConfig("build", index)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleProjectAddConfig("build")}
                className="add-btn"
              >
                + Add Build Config
              </button>

              {/* Tests Section */}
              <h3 className="section-title">Tests Configurations</h3>
              {projectFormData.tests.map((test, index) => (
                <div key={index} className="config-item">
                  <input
                    type="text"
                    placeholder="Test Name"
                    value={test.name}
                    onChange={(e) => handleProjectConfigChange("tests", index, "name", e.target.value)}
                    className="config-input"
                  />
                  <input
                    type="text"
                    placeholder="Test Type"
                    value={test.type}
                    onChange={(e) => handleProjectConfigChange("tests", index, "type", e.target.value)}
                    className="config-input"
                  />
                  <input
                    type="text"
                    placeholder="Command"
                    value={test.cmd}
                    onChange={(e) => handleProjectConfigChange("tests", index, "cmd", e.target.value)}
                    className="config-input"
                  />
                  <input
                    type="text"
                    placeholder="Status"
                    value={test.status}
                    onChange={(e) => handleProjectConfigChange("tests", index, "status", e.target.value)}
                    className="config-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleProjectDeleteConfig("tests", index)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleProjectAddConfig("tests")}
                className="add-btn"
              >
                + Add Test Config
              </button>

              {/* Deploy Section */}
              <h3 className="section-title">Deploy Configurations</h3>
              {projectFormData.deploy.map((deploy, index) => (
                <div key={index} className="config-item">
                  <input
                    type="text"
                    placeholder="Deploy Name"
                    value={deploy.name}
                    onChange={(e) => handleProjectConfigChange("deploy", index, "name", e.target.value)}
                    className="config-input"
                  />
                  <input
                    type="text"
                    placeholder="Command"
                    value={deploy.cmd}
                    onChange={(e) => handleProjectConfigChange("deploy", index, "cmd", e.target.value)}
                    className="config-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleProjectDeleteConfig("deploy", index)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleProjectAddConfig("deploy")}
                className="add-btn"
              >
                + Add Deploy Config
              </button>
            </div>
          ) : (
            // Terraform Form
            <div className="terraform-form">
              {/* Providers Section */}
              <h2 className="section-title">Providers</h2>
                {terraformFormData.providers.map((provider, index) => (
                  <div key={index} className="config-item">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Provider Name"
                        value={provider.name}
                        onChange={(e) => handleTerraformItemChange("providers", index, "name", e.target.value)}
                        className="config-input"
                      />
                      <input
                        type="text"
                        placeholder="Version"
                        value={provider.version}
                        onChange={(e) => handleTerraformItemChange("providers", index, "version", e.target.value)}
                        className="config-input"
                      />
                      <button
                        type="button"
                        onClick={() => handleTerraformDeleteItem("providers", index)}
                        className="delete-btn"
                      >
                        🗑️
                      </button>
                    </div>
                    {/* Provider Attributes */}
                    <div className="attributes-container">
                      {provider.attributes?.map((attr, attrIndex) => (
                        <div key={attrIndex} className="attribute-item">
                          <input
                            type="text"
                            placeholder="Key"
                            value={attr.key}
                            onChange={(e) => handleTerraformAttributeChange("providers", index, attrIndex, "key", e.target.value)}
                            className="attribute-input"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={attr.value}
                            onChange={(e) => handleTerraformAttributeChange("providers", index, attrIndex, "value", e.target.value)}
                            className="attribute-input"
                          />
                          <button
                            type="button"
                            onClick={() => handleTerraformDeleteAttribute("providers", index, attrIndex)}
                            className="delete-btn"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleTerraformAddAttribute("providers", index)}
                        className="add-btn"
                      >
                        + Add Attribute
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleTerraformAddItem("providers")}
                  className="add-btn"
                >
                  + Add Provider
                </button>
              {/* Resources Section */}
              <h2 className="section-title">Resources</h2>
              {terraformFormData.resources.map((resource, index) => (
                <div key={index} className="config-item">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Resource Name"
                      value={resource.name}
                      onChange={(e) => handleTerraformItemChange("resources", index, "name", e.target.value)}
                      className="config-input"
                    />
                    <input
                      type="text"
                      placeholder="Resource Type"
                      value={resource.type}
                      onChange={(e) => handleTerraformItemChange("resources", index, "type", e.target.value)}
                      className="config-input"
                    />
                    <button
                      type="button"
                      onClick={() => handleTerraformDeleteItem("resources", index)}
                      className="delete-btn"
                    >
                      🗑️
                    </button>
                  </div>
                  {/* Resource Attributes */}
                  <div className="attributes-container">
                    {resource.attributes?.map((attr, attrIndex) => (
                      <div key={attrIndex} className="attribute-item">
                        <input
                          type="text"
                          placeholder="Key"
                          value={attr.key}
                          onChange={(e) => handleTerraformAttributeChange("resources", index, attrIndex, "key", e.target.value)}
                          className="attribute-input"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={attr.value}
                          onChange={(e) => handleTerraformAttributeChange("resources", index, attrIndex, "value", e.target.value)}
                          className="attribute-input"
                        />
                        <button
                          type="button"
                          onClick={() => handleTerraformDeleteAttribute("resources", index, attrIndex)}
                          className="delete-btn"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleTerraformAddAttribute("resources", index)}
                      className="add-btn"
                    >
                      + Add Attribute
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleTerraformAddItem("resources")}
                className="add-btn"
              >
                + Add Resource
              </button>

              {/* Variables Section */}
              <h2 className="section-title">Variables</h2>
              {terraformFormData.variables.map((variable, index) => (
                <div key={index} className="config-item">
                  <input
                    type="text"
                    placeholder="Variable Name"
                    value={variable.name}
                    onChange={(e) => handleTerraformItemChange("variables", index, "name", e.target.value)}
                    className="config-input"
                  />
                  <input
                      type="text"
                      placeholder="Variable Type"
                      value={variable.type}
                      onChange={(e) => handleTerraformItemChange("variables", index, "type", e.target.value)}
                      className="config-input"
                    />
                  <button
                    type="button"
                    onClick={() => handleTerraformDeleteItem("variables", index)}
                    className="delete-btn"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleTerraformAddItem("variables")}
                  className="add-btn"
                >
                  + Add Variable
                </button>
  
                {/* Outputs Section */}
                <h2 className="section-title">Outputs</h2>
                {terraformFormData.outputs.map((output, index) => (
                  <div key={index} className="config-item">
                    <input
                      type="text"
                      placeholder="Output Name"
                      value={output.name}
                      onChange={(e) => handleTerraformItemChange("outputs", index, "name", e.target.value)}
                      className="config-input"
                    />
                    <input
                      type="text"
                      placeholder="Output Value"
                      value={output.value}
                      onChange={(e) => handleTerraformItemChange("outputs", index, "value", e.target.value)}
                      className="config-input"
                    />
                    <button
                      type="button"
                      onClick={() => handleTerraformDeleteItem("outputs", index)}
                      className="delete-btn"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleTerraformAddItem("outputs")}
                  className="add-btn"
                >
                  + Add Output
                </button>
              </div>
            )}
  
            <div className="button-container">
              <button type="submit" className="submit-btn">
                Preview JSON
              </button>
            </div>
          </form>
  
          {showJsonPreview && (
            <div className="json-preview">
              <h3>JSON Preview</h3>
              <pre>{jsonPreview}</pre>
              <button onClick={handleConfirmSubmit} className="confirm-btn">
                Confirm and Generate File
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default Form;
  