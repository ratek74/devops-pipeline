pipeline {
    agent any

    tools {
        maven 'Maven 3'
        jdk 'Java 21'
    }

    environment {
        BACKEND_IMAGE = 'kumarritik74/taskmanager-backend:latest'
        FRONTEND_IMAGE = 'kumarritik74/taskmanager-frontend:latest'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Maven Clean') {
            steps {
                bat 'mvn clean'
            }
        }

        stage('Compile') {
            steps {
                bat 'mvn compile'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'mvn test'
            }
        }

        stage('Package Application') {
            steps {
                bat 'mvn package -DskipTests'
            }
        }

        stage('Build Docker Images') {
            steps {
                // Build Backend Image
                bat "docker build -t ${BACKEND_IMAGE} ."
                // Build Frontend Image
                bat "docker build -t ${FRONTEND_IMAGE} ./frontend"
            }
        }

        stage('Push Docker Images') {
            steps {
                // Log in to Docker Hub using credentials stored in Jenkins
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat "docker login -u %DOCKER_USER% -p %DOCKER_PASS%"
                    bat "docker push ${BACKEND_IMAGE}"
                    bat "docker push ${FRONTEND_IMAGE}"
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully.'
        }
        failure {
            echo 'Pipeline execution failed.'
        }
    }
}
