import React, { useState, useRef, useEffect } from "react";
// UI imports
// prettier-ignore
import { useDisclosure, Button, Icon, Flex, Text, ChakraProvider } from "@chakra-ui/react";
// Icons
// prettier-ignore
import { BsPlusLg, BsSortNumericUp, BsFillStarFill, BsSortNumericDownAlt, BsShuffle, BsFillHandThumbsUpFill, BsFillHandThumbsDownFill } from "react-icons/bs";
// Components
import { PostCard } from "../components/PostCard";
import { CreatePostModal } from "../components/CreatePostModal";
import { Navbar } from "../components/Navbar";
// Styling
import styles from "../styles/Home.module.css";
// Dependencies
import { v4 as uuidv4 } from "uuid";
import ReactGA from "react-ga";
import axios from "axios";
// Google Analytics ID
const TRACKING_ID = "UA-253199381-1"; // OUR_TRACKING_ID

export async function getServerSideProps() {
	const res = await fetch("https://api.hottake.gg/posts");
	const postsFromDB = await res.json();
	return { props: { postsFromDB } };
}

async function fetchPosts(type) {
	// "https://api.hottake.gg/posts"
	try {
		// console.log(type);
		const response = await axios.get(
			`http://localhost:3001/posts?method=${type}`
		);

		// console.log(response.data[0]);
		return response;
	} catch (error) {
		console.error(error);
	}
}

export default function Home({ postsFromDB }) {
	// key for sorting button
	const SORT_ICONS = [
		{ icon: BsSortNumericDownAlt, name: "New", w: 6, h: 6 },
		{ icon: BsFillStarFill, name: "Popular", w: 4, h: 4 },
		{ icon: BsSortNumericUp, name: "Old", w: 6, h: 6 },
		{ icon: BsShuffle, name: "Random", w: 6, h: 6 },
		{ icon: BsFillHandThumbsDownFill, name: "Disagreed", w: 5, h: 5 },
		{ icon: BsFillHandThumbsUpFill, name: "Agreed", w: 5, h: 5 },
	];
	const [sortMethod, setSortMethod] = useState(0);

	// states
	const [animated, setAnimated] = useState({ left: false, right: false }); // Left and Right flashing animations
	const [uuid, setUUID] = useState(null);
	const scrollContainerRef = useRef(null); // To access scroll container containing posts
	const { isOpen, onOpen, onClose } = useDisclosure(); // Modal state
	const [posts, setPosts] = useState(postsFromDB);

	useEffect(() => {
		// Google Analytics initialization
		ReactGA.initialize(TRACKING_ID);
		ReactGA.pageview(window.location.pathname);

		// Check if user has visited already
		if (localStorage.getItem("uuid") == null) {
			// If not, add UUID to local storage.
			localStorage.setItem("uuid", uuidv4());
			setUUID(localStorage.getItem("uuid"));
		} else {
			//console.log("UUID: "+localStorage.getItem("uuid"))
			setUUID(localStorage.getItem("uuid"));
		}
	}, []);

	return (
		<>
			<Navbar />
			<CreatePostModal isOpen={isOpen} onClose={onClose} />
			<Button
				onClick={onOpen}
				colorScheme="teal"
				style={{
					zIndex: "999",
					height: "48px",
					width: "48px",
					// aspectRatio: "1/1",
					borderRadius: "100%",
					position: "fixed",
					right: "18px",
					bottom: "18px",
				}}
			>
				<Icon as={BsPlusLg} w={4} h={4} color="white" />
			</Button>
			<Flex
				justify="center"
				align="center"
				gap="6px"
				style={{
					zIndex: "999",
					position: "fixed",
					left: "18px",
					bottom: "18px",
				}}
			>
				<Button
					onClick={() => {
						setSortMethod((prev) => {
							if (prev + 1 > SORT_ICONS.length - 1) {
								return 0;
							} else return prev + 1;
						});
						fetchPosts(
							SORT_ICONS[
								(sortMethod + 1) % SORT_ICONS.length
							].name.toLowerCase()
						).then((res) => setPosts(res.data));
						setTimeout(() => {
							scrollContainerRef.current.scrollTo({
								top: 0,
								behavior: "smooth",
							});
						}, 250);
					}}
					colorScheme="gray"
					style={{
						background: "#718096",
						height: "48px",
						width: "48px",

						borderRadius: "25%",
					}}
				>
					<Icon
						as={SORT_ICONS[sortMethod].icon}
						w={SORT_ICONS[sortMethod].w}
						h={SORT_ICONS[sortMethod].h}
						color="white"
					/>
				</Button>
				<Text
					style={{
						background: "white",
						padding: "6px",
						borderRadius: ".5em",
					}}
					fontSize="large"
				>
					Sort by {SORT_ICONS[sortMethod].name}
				</Text>
			</Flex>

			<div
				id="scrollContainer"
				ref={scrollContainerRef}
				m={0}
				p={0}
				style={{
					marginLeft: "auto",
					marginRight: "auto",
					height: "100vh",
					width: "100vw",
					scrollSnapType: "y mandatory",
					overflowY: "scroll",
					scrollBehavior: "smooth",
				}}
			>
				{posts.map((post, i) => (
					<div key={post._id} style={{ position: "relative" }}>
						<div
							id="flexContainer"
							style={{
								overflow: "hidden",
								position: "absolute",
								display: "flex",
								scrollSnapAlign: "end",
								width: "100%",
								height: "100%",
							}}
						>
							<div
								onClick={() => {
									scrollContainerRef.current.scrollBy({ top: 50 });
									setAnimated((prev) => {
										return { ...prev, left: true };
									});
								}}
								onAnimationEnd={() =>
									setAnimated((prev) => {
										return { ...prev, left: false };
									})
								}
								style={{ width: "50%", height: "100vh" }}
								className={animated.left ? styles.animateGreen : ""}
							></div>

							<div
								onClick={() => {
									scrollContainerRef.current.scrollBy({ top: 50 });

									setAnimated((prev) => {
										return { ...prev, right: true };
									});
								}}
								onAnimationEnd={() =>
									setAnimated((prev) => {
										return { ...prev, right: false };
									})
								}
								style={{ width: "50%", height: "100vh" }}
								className={animated.right ? styles.animateRed : ""}
							></div>
						</div>

						<PostCard
							// title={post.title}
							// agree={post.agree}
							// disagree={post.disagree}
							// id={post._id}
							// interactions={post.interactions}
							{...post}
							uuid={uuid}
							setAnimated={setAnimated}
							scrollContainerRef={scrollContainerRef}
						/>
					</div>
				))}
			</div>
		</>
	);
}
