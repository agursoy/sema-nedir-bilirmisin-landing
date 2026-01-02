<template>
	<div class="h-screen w-screen">
		<div
			id="loading-image"
			ref="image"
			:style="{
				width: `${Math.round(videoFrameW / 2)}px`,
				height: `${Math.round(videoFrameH / 2)}px`,
			}"
			class="border-1 border-[#eceee2]/50 bg-[url(/frames/frame_001.webp)] bg-cover bg-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-xs hover:bg-neutral-secondary-medium"
		></div>

		<div
			ref="title"
			class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-extrablack"
		>
			<div
				class="text-snb-text-default rounded-[12px] w-96 text-8xl whitespace-wrap ml-12"
			>
				sema nedir bilir misin?
			</div>
		</div>
	</div>
	<div
		class="bg-gray-900/70 px-4 py-1 rounded-full text-1xl font-clean text-snb-text-default fixed bottom-6 right-5"
		ref="loadingText"
	>
		<div class="flex flex-row items-center justify-center gap-1">
			<img class="h-8 w-8" ref="iris" src="/iris.webp" />
			<span>yükleniyor..</span>
		</div>
	</div>
</template>
<script>
import {
	animate,
	createTimeline,
	stagger,
	utils,
	splitText,
	createSpring,
} from "animejs";

import { onMounted, ref, nextTick } from "vue";

export default {
	props: ["videoFrameW", "videoFrameH"],
	setup(props) {
		const iris = ref(null);
		const title = ref(null);
		const image = ref(null);

		const loadingText = ref(null);
		const { videoFrameW, videoFrameH } = props;

		onMounted(async () => {
			const { chars } = splitText(title.value, {
				chars: { class: "char opacity-0", clone: "top", wrap: "clip" },
			});
			const ease = createSpring({ stiffness: 90, damping: 11, duration: 2000 });

			createTimeline({ delay: 2500 })
				.add(title.value, {
					ease: "inOut(1.9)",
					x: "22vw",
				})
				.add(chars, {
					opacity: [0, 1],
					delay: stagger(70),
				})
				.add(
					".char > span",
					{ y: "100%", composition: "blend", ease, loop: true },
					stagger(10, { use: "data-char", from: "random" })
				)
				.init();

			animate(image.value, {
				delay: 3000,
				ease: "inOut(1.9)",
				x: "-18vw",
				scale: [1, 2],
			});

			animate(iris.value, {
				rotate: {
					from: "-1turn",
					duration: 10000,
				},
				ease: "inOut(1.9)",
				loop: true,
			});

			animate(loadingText.value, {
				opacity: [0, 1],
				loop: true,
				duration: 3000,
				alternate: true,
				ease: "inOut(1.9)",
			});
		});

		return {
			iris,
			image,
			title,
			loadingText,
			videoFrameW,
			videoFrameH,
		};
	},
};
</script>
<style>
#loading-image {
	padding: 10px;
	background-color: #eceee2;
}
</style>
