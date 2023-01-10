// prettier-ignore
import React, { useEffect, useRef, useState } from "react";
// UI Imports
// prettier-ignore
import { Stack, Input, Divider, Container, Heading, Button, Card, CardHeader, CardBody, CardFooter, Tooltip, Flex, Spacer, Text, Icon } from "@chakra-ui/react";
// Icons
// prettier-ignore
import { BsFillHandThumbsUpFill, BsFillHandThumbsDownFill, BsChat, BsReply } from "react-icons/bs";
// prettier-ignore
import { AiOutlineFire, AiOutlineInfoCircle, AiOutlineWarning, AiFillHeart, AiOutlineSend } from "react-icons/ai";
// Styling
// prettier-ignore
import { cardContainer, toolTipContainer, toolTipIcon, iconStyle } from "../styles/Card.module.css";
// Dependencies
import axios, { isCancel, AxiosError } from "axios";
// Components
import { PostComment } from "./PostComment";

import { useErrorToast } from "../hooks/useErrorToast";

export const PostCard = ({ uuid, setAnimated, scrollContainerRef, ...post }) => {
	const { title, agree, disagree, interactions, _id } = post;

	const { addToast } = useErrorToast();

	const API_URL = 'http://localhost:3001';

	const [heat, setHeat] = useState(agree.length + disagree.length);
	const [commentsOpen, setCommentsOpen] = useState(false);
	const [reportTooltip, setReportTooltip] = useState(false);
	const [infoTooltip, setInfoTooltip] = useState(false);
	const [comments, setComments] = useState([]);
	const commentInput = useRef(null);

	async function fetchComments() {
		// on startup fetch comments
		try{

			const res = await fetch("http://localhost:3001/comment?postID=" + _id);
			const commentsFromDB = await res.json();
			if (commentsFromDB.length !== 0) {
			setComments(commentsFromDB.map((item) => item));
			// console.log(comments);
		}

		}
		catch(e){
			console.error(e)
			addToast(e.message)


		}
		
	}

	useEffect(() => {
		fetchComments(); // fetch comments on mount
	}, []);

	useEffect(() => {
		// Update the document title using the browser API
	}, [comments]);

	function formatNumberCompact(num) {
		return new Intl.NumberFormat("en-GB", {
			notation: "compact",
		}).format(num);
	}

	function agreeWithPost() {
		setAnimated((prev) => ({ ...prev, left: true }));
		scrollContainerRef.current.scrollBy({ top: 50 });

		axios
			.post(`${API_URL}/agree`, { postID: _id, userUUID: uuid })
			.then(function (response) {
				if (agree.includes(uuid)) {
					setHeat((prev) => {
						agree.splice(agree.indexOf(uuid), 1);
						return prev - 1;
					});
					//our user has previously agreed, we should now undo the agree by -1ing from the number
				} else if (disagree.includes(uuid)) {
					setHeat((prev) => {
						agree.push(uuid);
						disagree.splice(disagree.indexOf(uuid), 1);
						return prev + 2;
					});
					//our user has previously disagreed, we should now undo disagree by +2ing the number
				} else {
					setHeat((prev) => {
						agree.push(uuid);
						return prev + 1;
					});
					//has not agreed or disagreed, just +1
				}

				//console.log(response)
			})
			.catch(function (error) {
				console.error(error);
				addToast(error.message);
			});
	}

	function disagreeWithPost() {
		setAnimated((prev) => ({ ...prev, right: true }));
		scrollContainerRef.current.scrollBy({ top: 50 }); // scroll to next

		axios
			.post(`${API_URL}/disagree`, {
				postID: _id,
				userUUID: uuid,
			})
			.then(function (response) {
				if (disagree.includes(uuid)) {
					setHeat((prev) => {
						disagree.splice(disagree.indexOf(uuid), 1);
						return prev + 1;
					});
				} else if (agree.includes(uuid)) {
					setHeat((prev) => {
						agree.splice(agree.indexOf(uuid), 1);
						disagree.push(uuid);

						return prev - 2;
					});
					//our user has previously disagreed, we should now undo disagree by +2ing the number
				} else {
					setHeat((prev) => {
						disagree.push(uuid);

						return prev - 1;
					});
					//has not agreed or disagreed, just +1
				}

				//console.log(response)
			})
			.catch(function (error) {
				console.error(error);
				addToast(error.message);
			});
	}

	return (
		<div className={cardContainer}>
			<Card variant="outline" bg="white" w="90%" maxW="400px">
				{/* tool tip container */}
				<div className={toolTipContainer}>
					<Tooltip label="Report this post" isOpen={reportTooltip}>
						<Button
							onMouseEnter={() => setReportTooltip(true)}
							onMouseLeave={() => setReportTooltip(false)}
							onClick={() => setReportTooltip(true)}
							color="gray.300"
							variant="ghost"
							className={toolTipIcon}
							_hover={{ color: "var(--chakra-colors-gray-500)" }}
							_active={{ transform: "scale(.9)" }}
						>
							<AiOutlineWarning className={iconStyle} />
						</Button>
					</Tooltip>

					<Tooltip label={"Total votes: " + interactions} isOpen={infoTooltip}>
						<Button
							onMouseEnter={() => setInfoTooltip(true)}
							onMouseLeave={() => setInfoTooltip(false)}
							onClick={() => setInfoTooltip(true)}
							color="gray.300"
							variant="ghost"
							className={toolTipIcon}
							_hover={{ color: "var(--chakra-colors-gray-500)" }}
							_active={{ transform: "scale(.9)" }}
						>
							<AiOutlineInfoCircle className={iconStyle} />
						</Button>
					</Tooltip>
				</div>
				{/* content */}
				<CardBody p="16px">
					<Stack mt="6" spacing="3">
						<Heading size="lg">{title}</Heading>
					</Stack>
				</CardBody>
				{/* buttons */}
				<CardBody p="16px">
					{/* //agree heat and disagree div */}
					<Flex style={{ width: "100%" }} gap="6px">
						<Button
							width="125px"
							leftIcon={<BsFillHandThumbsUpFill />}
							variant="outline"
							colorScheme="teal"
							color="#319795"
							onClick={agreeWithPost}
							style={{
								backgroundColor: agree.includes(uuid) ? "#B2F5EA" : "white",
							}}
						>
							<Text fontSize={{ base: "12px", sm: "15px" }}>{agree.length} Agree</Text>
						</Button>
						<Spacer />
						<Button
							leftIcon={<AiOutlineFire />}
							disabled
							variant="outline"
							color="black"
							colorScheme="gray"
						>
							{formatNumberCompact(heat)}
						</Button>
						<Spacer />
						<Button
							width="125px"
							rightIcon={<BsFillHandThumbsDownFill />}
							variant="outline"
							colorScheme="red"
							color="#ff5242"
							onClick={disagreeWithPost}
							style={{
								backgroundColor: disagree.includes(uuid) ? "#FEB2B2" : "white",
							}}
						>
							<Text fontSize={{ base: "12px", sm: "15px" }}>{disagree.length} Disagree</Text>
						</Button>
					</Flex>
					{/* //agree heat disagree div ends */}
				</CardBody>

				<Divider />

				<CardFooter p="16px">
					<Flex w="100%" align="" direction="column" gap={2}>
						<Flex
							w="100%"
							justify="center"
							align="center"
							gap={2}
							onClick={() => setCommentsOpen((i) => !i)}
							color="gray.500"
						>
							<Icon as={BsChat} />
							<Text>Comments ({comments.length})</Text>
						</Flex>
						{commentsOpen && (
							<div>
								<Card variant="outline">
									<div
										style={{
											maxHeight: "176px",
											overflowY: "scroll",
											overflowX: "hidden",
										}}
									>
										
										{comments.map((comment) => {
											return <PostComment key={comment._id} content={comment.content} time={comment.date} />;
										})}

										{/* <Divider />
												<Container m={1} ml={4} position="relative">
													<Icon
														w={3}
														h={3}
														as={AiFillHeart}
														fill="red"
														style={{
															position: "absolute",
															top: "20px",
															right: "28px",
														}}
													/>
													<Icon
														w={3}
														h={3}
														as={BsReply}
														style={{
															position: "absolute",
															top: "20px",
															right: "44px",
														}}
													/>
													<Text fontSize="xs">10:01 am, Jan 5</Text>
													<Text>u just coping</Text>
												</Container> */}
									</div>
									<Divider />

									<CardFooter
										style={{
											margin: "0",
											padding: "0",
										}}
									>
										<Flex direction="row" w="100%" justify="center" align="center">
											<Input
												variant="filled"
												placeholder="Comment your thoughts..."
												ref={commentInput}
												style={{ margin: "8px" }}
											/>
											<Icon
												as={AiOutlineSend}
												h={6}
												w={6}
												mr="8px"
												onClick={() => {
													let inputtedComment = commentInput.current.value;
													commentInput.current.value = "";
													setComments((prev) => {
														let prevComments = [...prev];
														prevComments.push(inputtedComment);
														return prevComments;
													});
													//we have the id, we make a post request to /comment
													axios
														.post("http://localhost:3001/comment", {
															content: inputtedComment,
															postID: _id,
														})
														.then(function (response) {
															// reload to refetch
															// TODO: Change this to redirect to hottake.gg/post_id
														})
														.catch(function (error) {
															// implement error state
															console.error(error);
															addToast(error.message);
														});

													//console.log(commentInput.current.value)
												}}
											/>
										</Flex>
									</CardFooter>
								</Card>
							</div>
						)}
					</Flex>
				</CardFooter>
			</Card>
		</div>
	);
};
