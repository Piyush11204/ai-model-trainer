const express = require('express');
const router = express.Router();
const multer = require('multer');
const modelController = require('../controllers/modelController');
const { validateUpload, validateUpdate, validateQuery } = require('../middleware/validate');

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
});

// Routes
router.post('/models', upload.single('dataset'), validateUpload, modelController.createModel);
router.get('/models', validateQuery, modelController.getAllModels);
router.get('/models/:id', modelController.getModel);
router.put('/models/:id', validateUpdate, modelController.updateModel);
router.delete('/models/:id', modelController.deleteModel);
router.get('/models/:id/status', modelController.getModelStatus);

module.exports = router;
