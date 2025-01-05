const express = require('express');
const router = express.Router();
const workInstructionController = require('../controllers/workInstructionController');

router.get('/', workInstructionController.list);
router.get('/:id', workInstructionController.get);
router.post('/', workInstructionController.create);
router.put('/:id', workInstructionController.update);
router.delete('/:id', workInstructionController.remove);

router.get('/:id/pdf', workInstructionController.exportPdf);

module.exports = router;
