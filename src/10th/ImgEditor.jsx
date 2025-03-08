import { useState, useRef, useEffect } from "react";
import { useLocalStorage } from "../helpers/useLocalStorage";

export const ImgEditor = ({ image, name }) => {
	const [scale, setScale] = useLocalStorage(`scale_${name}`, 1);
	const [positionX, setPositionX] = useLocalStorage(`positionX_${name}`, 0);
	const [positionY, setPositionY] = useLocalStorage(`positionY_${name}`, 0);

	const [dragging, setDragging] = useState(false);
	const [startPos, setStartPos] = useState({ x: 0, y: 0 });
	const imgRef = useRef(null);

	const handleWheel = (e) => {
		e.preventDefault();
		setScale((prevScale) =>
			Math.min(Math.max(parseFloat(prevScale) + e.deltaY * -0.001, 0.8), 5),
		);
	};

	const handleMouseDown = (e) => {
		setDragging(true);
		setStartPos({
			x: e.clientX - parseFloat(positionX),
			y: e.clientY - parseFloat(positionY),
		});
	};

	const handleMouseMove = (e) => {
		if (dragging) {
			setPositionX(e.clientX - startPos.x);
			setPositionY(e.clientY - startPos.y);
		}
	};

	const handleMouseUp = () => {
		setDragging(false);
	};

	const handleDragStart = (e) => {
		e.preventDefault();
	};

	useEffect(() => {
		const imgElement = imgRef.current;
		if (imgElement) {
			imgElement.addEventListener("wheel", handleWheel);
			imgElement.addEventListener("mousedown", handleMouseDown);
			imgElement.addEventListener("dragstart", handleDragStart);
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}
		return () => {
			if (imgElement) {
				imgElement.removeEventListener("wheel", handleWheel);
				imgElement.removeEventListener("mousedown", handleMouseDown);
				imgElement.removeEventListener("dragstart", handleDragStart);
				window.removeEventListener("mousemove", handleMouseMove);
				window.removeEventListener("mouseup", handleMouseUp);
			}
		};
	}, [dragging]);

	return (
		<div
			ref={imgRef}
			className="h-full w-full"
			style={{
				cursor: dragging ? "grabbing" : "grab",
				overflow: "hidden",
			}}
		>
			<img
				src={image}
				alt=""
				style={{
					width: "100%",
					height: "100%",
					transform: `translate(${positionX}px, ${positionY}px) scale(${scale})`,
					transformOrigin: "center",
					userSelect: "none",
					objectFit: "contain",
				}}
			/>
		</div>
	);
};
