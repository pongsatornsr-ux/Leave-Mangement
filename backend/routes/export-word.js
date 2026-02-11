const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const createReport = require('docx-templates').default;

const { PersonalLeave, VacationLeave } = require('../models');

router.get('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;

    let leave;
    let templatePath;

    if (type === 'personal') {
      leave = await PersonalLeave.findByPk(id);
      templatePath = path.resolve(__dirname, '../templates/personalLeave.docx');
    } else if (type === 'vacation') {
      leave = await VacationLeave.findByPk(id);
      templatePath = path.resolve(__dirname, '../templates/vacationLeave.docx');
    } else {
      return res.status(400).send('Invalid leave type');
    }

    if (!leave) return res.status(404).send('Leave not found');

    const template = fs.readFileSync(templatePath);

    const buffer = await createReport({
      template,
      data: leave.toJSON()
    });

    res.setHeader('Content-Disposition', `attachment; filename=${type}_leave_${id}.docx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
