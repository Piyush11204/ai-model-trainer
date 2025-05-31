import sys
import pandas as pd
import cloudinary
import cloudinary.uploader
import cloudinary.api
from sklearn.linear_model import LogisticRegression
import joblib
import subprocess
import os
from datetime import datetime
from dotenv import load_dotenv
import logging
import validators
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('python/train_model.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Cloudinary configuration
try:
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET")
    )
    logger.info("Cloudinary configuration loaded")
except Exception as e:
    logger.error(f"Failed to configure Cloudinary: {str(e)}")
    sys.exit(1)

def validate_dataset(dataset_path):
    """Validate the dataset file."""
    try:
        if not os.path.exists(dataset_path):
            raise FileNotFoundError("Dataset file not found")
        data = pd.read_csv(dataset_path)
        if data.empty:
            raise ValueError("Dataset is empty")
        if data.shape[1] < 2:
            raise ValueError("Dataset must have at least one feature and one target column")
        logger.info(f"Dataset validated: {data.shape[0]} rows, {data.shape[1]} columns")
        return data
    except Exception as e:
        logger.error(f"Dataset validation failed: {str(e)}")
        raise

def train_model(dataset_url, description):
    """Train model, save as .pkl, generate documentation, and upload to Cloudinary."""
    try:
        logger.info(f"Starting model training with dataset: {dataset_url}")

        # Validate dataset URL
        if not validators.url(dataset_url):
            raise ValueError("Invalid dataset URL")

        # Download dataset from Cloudinary
        dataset_filename = f"temp_dataset_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        subprocess.run(["wget", "-O", dataset_filename, dataset_url], check=True, capture_output=True)
        logger.info(f"Dataset downloaded: {dataset_filename}")

        # Validate dataset
        data = validate_dataset(dataset_filename)
        X = data.iloc[:, :-1]  # Features
        y = data.iloc[:, -1]   # Target

        # Train model (placeholder for Grok API)
        model = LogisticRegression(max_iter=1000)
        model.fit(X, y)
        logger.info("Model training completed")

        # Save model as .pkl
        model_filename = f"model_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
        joblib.dump(model, model_filename)
        logger.info(f"Model saved locally: {model_filename}")

        # Upload model to Cloudinary
        model_upload = cloudinary.uploader.upload(model_filename, resource_type="raw", folder="models")
        model_url = model_upload["secure_url"]
        logger.info(f"Model uploaded to Cloudinary: {model_url}")

        # Generate documentation
        doc_filename = generate_documentation(description, model_filename, data.shape)
        doc_upload = cloudinary.uploader.upload(doc_filename, resource_type="raw", folder="docs")
        doc_url = doc_upload["secure_url"]
        logger.info(f"Documentation uploaded to Cloudinary: {doc_url}")

        # Clean up local files
        for file in [dataset_filename, model_filename, doc_filename, doc_filename.replace(".tex", ".pdf")]:
            if os.path.exists(file):
                os.remove(file)
                logger.info(f"Cleaned up local file: {file}")

        return model_url, doc_url
    except Exception as e:
        logger.error(f"Error in model training: {str(e)}")
        raise
    finally:
        # Ensure cleanup even on failure
        for file in [dataset_filename, model_filename, doc_filename, doc_filename.replace(".tex", ".pdf")]:
            if os.path.exists(file):
                os.remove(file)
                logger.info(f"Cleaned up local file: {file}")

def generate_documentation(description, model_filename, dataset_shape):
    """Generate PDF documentation using LaTeX."""
    try:
        logger.info("Generating documentation...")
        with open("templates/doc_template.tex", "r") as f:
            template = f.read()

        # Sanitize description to prevent LaTeX injection
        description = re.sub(r'[\\{}&%#$_\^~]', '', description)
        doc_content = template.replace("{{DESCRIPTION}}", description)
        doc_content = doc_content.replace("{{MODEL_NAME}}", model_filename)
        doc_content = doc_content.replace("{{DATE}}", datetime.now().strftime("%Y-%m-%d"))
        doc_content = doc_content.replace("{{DATASET_ROWS}}", str(dataset_shape[0]))
        doc_content = doc_content.replace("{{DATASET_COLUMNS}}", str(dataset_shape[1]))

        # Save LaTeX file
        doc_filename = f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}.tex"
        with open(doc_filename, "w") as f:
            f.write(doc_content)

        # Compile LaTeX to PDF
        result = subprocess.run(["pdflatex", doc_filename], capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"LaTeX compilation failed: {result.stderr}")
        pdf_filename = doc_filename.replace(".tex", ".pdf")
        logger.info(f"Documentation generated: {pdf_filename}")
        return pdf_filename
    except Exception as e:
        logger.error(f"Error generating documentation: {str(e)}")
        raise

if __name__ == "__main__":
    if len(sys.argv) != 3:
        logger.error("Invalid arguments. Usage: python train_model.py <dataset_url> <description>")
        sys.exit(1)

    dataset_url = sys.argv[1]
    description = sys.argv[2]
    try:
        model_url, doc_url = train_model(dataset_url, description)
        print(f"Model URL: {model_url}")
        print(f"Documentation URL: {doc_url}")
    except Exception as e:
        logger.error(f"Script failed: {str(e)}")
        sys.exit(1)
