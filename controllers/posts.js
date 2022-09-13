import mongoose from "mongoose";
import { PostMessage } from "../models/postMessage.js";

export const getPost = async (req, res) => {
	const { id } = req.params;

	try {
		const post = await PostMessage.findById(id);
		res.status(200).json(post);
	} catch (error) {
		res.status(404).json({ message: error.message, place: "getPost aaaa", id: id });
	}
};

export const getPosts = async (req, res, next) => {
	const { page } = req.query;
	try {
		const LIMIT = 8;
		const startIndex = (Number(page) - 1) * LIMIT; //get the starting index of every page
		const total = await PostMessage.countDocuments({});
		const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

		res.status(200).json({
			data: posts,
			currentPage: Number(page),
			numberOfPages: Math.ceil(total / LIMIT),
		});
	} catch (error) {
		res.status(404).json({ message: error.message, place: "getPosts" });
	}
};

export const getPostsBySearch = async (req, res, next) => {
	const { searchQuery, tags } = req.query;
	try {
		const title = new RegExp(searchQuery, "i");
		const posts = await PostMessage.find({
			$or: [{ title }, { tags: { $in: tags.split(",") } }],
		});

		res.status(200).json({ data: posts });
	} catch (error) {
		res.status(404).json({ message: error.message, place: "getPostBySearch" });
	}
};

export const createPost = async (req, res, next) => {
	const post = req.body;

	const newPost = new PostMessage({
		...post,
		tags: post.tags.map((tag) => tag.trim()),
		creator: req.userId,
		createdAt: new Date().toISOString(),
	});

	try {
		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		res.status(409).json({ message: error.message });
	}
};

export const updatePost = async (req, res, next) => {
	const post = req.body;
	const { id: _id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("No post with that id");
	try {
		const updatedPost = await PostMessage.findByIdAndUpdate(
			_id,
			{ ...post, tags: post.tags.map((tag) => tag.trim()), _id },
			{ new: true }
		);
		res.status(201).json(updatedPost);
	} catch (error) {
		res.status(409).json({ message: error.message });
	}
};

export const deletePost = async (req, res, next) => {
	const { id: _id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("No post with that id");

	try {
		await PostMessage.findByIdAndDelete(_id);
		res.json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log(error);
	}
};

export const likePost = async (req, res, next) => {
	const { id: _id } = req.params;

	if (!req.userId) return res.json({ message: "User not authenticated" });

	if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("No post with that id");

	try {
		const post = await PostMessage.findById(_id);
		const index = post.likes.findIndex((id) => id === String(req.userId));

		if (index === -1) {
			post.likes.push(req.userId);
		} else {
			post.likes = post.likes.filter((id) => id !== req.userId);
		}

		const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, { new: true });
		res.json(updatedPost);
	} catch (error) {
		console.log(error);
	}
};

export const commentPost = async (req, res, next) => {
	const { id } = req.params;
	const { value } = req.body;

	try {
		const post = await PostMessage.findById(id);
		post.comments.push(value);
		const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });

		res.status(200).json(updatedPost);
	} catch (error) {
		console.log(error);
	}
};
