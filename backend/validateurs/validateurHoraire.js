import { body } from "express-validator";

const addHoraireValidation = [
    body('employe_id').notEmpty().withMessage('employe_id est requis'),
]

const updateHoraireValidation = [
    body('employe_id').notEmpty().withMessage('employe_id est requis'),
]

export {addHoraireValidation, updateHoraireValidation};