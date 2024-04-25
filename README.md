# Swagger Generator

The Swagger Generator is a tool designed to streamline the conversion of cURL commands into Swagger 2 or OpenAPI formats. It offers an intuitive interface for simplifying the process of documenting API endpoints.

## Getting Started

Follow these steps to set up and use the Swagger Generator:

1. **Clone the Repository**: 
    ```sh
    git clone https://github.com/elvus/swagger-generator.git
    ```
    This command clones the project repository to your local machine.

2. **Navigate to the Project Directory**: 
    ```sh
    cd swagger-generator
    ```
    Move into the project directory.

3. **Install Dependencies**: 
    ```sh
    npm install
    ```
    This command installs all necessary dependencies required for running the Swagger Generator.

4. **Run the Application**: 
    ```sh
    npm run dev
    ```
    Start the application by running this command. It will launch the Swagger Generator interface, allowing you to convert cURL commands effortlessly into Swagger or OpenAPI formats.

5. **Access the Interface**: 
    After running the application, open your web browser and go to [http://localhost:5173/](http://localhost:5173/) to access the Swagger Generator interface.

## Docker

Alternatively, you can use Docker to deploy the Swagger Generator:

1. **Build the Docker Image**:
    ```sh
    docker build -t swagger_gen .
    ```
    This command builds the Docker image named `swagger_gen`.

2. **Run the Docker Container**:
    ```sh
    docker run --name=swagger_gen -p 5173:5173 swagger_gen
    ```
    Execute the Docker container with the specified name (`swagger_gen`) and port mapping. This will deploy the Swagger Generator within a Docker container.

Feel free to explore and utilize the Swagger Generator to enhance your API documentation process.