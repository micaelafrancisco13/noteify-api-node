const {
    Category,
    validate,
    isObjectIdValid,
} = require("../models/category");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const categories = await Category.find().sort("name");
    
    res.send(categories);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let category = new Category({ name: req.body.name });
    category = await category.save();

    res.send(category);
});

router.put("/:categoryId", async (req, res) => {
    const categoryId = req.params.categoryId;

    if (!isObjectIdValid(categoryId))
        return res.status(400).send("Invalid object ID.");

    const category = await Category.findById(categoryId);

    if (!category)
        return res
            .status(404)
            .send(`The category with the ID of ${categoryId} was not found.`);

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    category.name = req.body.name;
    category.save();

    res.send(category);
});

router.delete("/:categoryId", async (req, res) => {
    const categoryId = req.params.categoryId;

    if (!isObjectIdValid(categoryId))
        return res.status(400).send("Invalid object ID.");

    const category = await Category.findByIdAndRemove(categoryId);

    if (!category)
        return res
            .status(404)
            .send(`The category with the ID of ${categoryId} was not found.`);

    res.send(category);
});

router.get("/:categoryId", async (req, res) => {
    const categoryId = req.params.categoryId;

    if (!isObjectIdValid(categoryId))
        return res.status(400).send("Invalid object ID.");

    const category = await Category.findById(categoryId);

    if (!category)
        return res
            .status(404)
            .send(`The category with the ID of ${categoryId} was not found.`);

    res.send(category);
});

module.exports = router;
