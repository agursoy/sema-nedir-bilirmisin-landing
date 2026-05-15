<template>
	<div class="bg-snb-bg-default">
		<!-- Tam ekran arka plan video oynatıcı — scroll container DIŞINDA -->

		<Transition>
			<div v-show="loading">
				<loading :video-frame-w="videoFrameW" :video-frame-h="videoFrameH" />
			</div>
		</Transition>
		<Transition>
			<div v-show="!loading">
				<video-frame-player
					v-show="!loading"
					:canvas_w="videoFrameW"
					:canvas_h="videoFrameH"
					ref="videoFramePlayer"
					@preload-completed="loading = false"
				/>

				<div class="scroll-container h-screen overflow-y-scroll relative z-20">
					<div class="relative" :class="scrollHeight">
						<div class="sticky top-1/2 -translate-y-1/2 w-full">
							<div class="flex flex-col gap-5 justify-center items-center">
								<div
									id="text"
									class="w-full md:w-2/3 lg:w-1/2 relative p-5 md:p-12 pb-14 contain-layout"
									:style="textSplitStyle"
								>
									<div class="relative">
										<h1
											:id="`header-${currentIndex}`"
											:class="`header-${currentIndex}`"
											class="text-lg md:text-5xl text-snb-text-default font-clean"
										>
											{{ currentHeader }}
										</h1>
										<h2
											:id="`paragraph-${currentIndex}`"
											:class="`paragraph-${currentIndex}`"
											class="text-md md:text-xl text-snb-text-default font-clean pt-6"
										>
											{{ currentParagraph }}
										</h2>
									</div>
									<scroll-down-message-bar
										:isScrolling="isScrolling"
										:isFinished="currentProgress >= 0.9"
									></scroll-down-message-bar>
								</div>
							</div>
							<ticket-modal :progress="splitProgress" :tickets="tickets" />
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script>
import { useScrollTimeline } from "./composables/useScrollTimeline.js";
import { useSplitAnimation } from "./composables/useSplitAnimation.js";
import VideoFramePlayer from "./components/VideoFramePlayer.vue";
import ScrollDownMessageBar from "./components/ScrollDownMessageBar.vue";
import Loading from "./components/Loading.vue";
import TicketModal from "./components/TicketModal.vue";

import { watch, ref } from "vue";

export default {
	components: {
		VideoFramePlayer,
		Loading,
		ScrollDownMessageBar,
		TicketModal,
	},
	setup() {
		const videoFramePlayer = ref(null);
		const loading = ref(true);

		const isMobile =
			/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
			window.innerWidth < 768;

		const videoFrameW = ref(isMobile ? 360 : 720);
		const videoFrameH = ref(isMobile ? 203 : 405);
		const scrollHeight = ref(isMobile ? "h-[500vh]" : "h-[1000vh]");

		let isScrollingTimerId;
		const isScrolling = ref(false);

		const tickets = [
			{
				label: "20 Mayıs 2026 Çarşamba 19:30 - AKM Bilet Al",
				url: "https://biletinial.com/tr-tr/muzik/sema-nedir-bilir-misin-sema-mukabelesi-deneyimi-akm",
			},
			{
				label: "17 Haziran 2026 Çarşamba 19:30 - AKM Bilet Al",
				url: "https://biletinial.com/tr-tr/muzik/sema-nedir-bilir-misin-sema-mukabelesi-deneyimi-akm",
			},
		];

		const scenes = [
			{
				header: "SEMA NEDİR BİLİR MİSİN?",
				paragraph:
					"Bilir misin sema nedir; 'Belâ' (Evet) sesini işitmek, Hakk'a ulaşıp, kendini kendinden kesmektir Bilir misin sema nedir; varlıktan habersiz olmak Mutlak fanilik içinde ebedilik zevkini tatmaktır",
				style: {},
			},
			{
				header: "Sultan Veled Devri",
				paragraph:
					"İnsan yeryüzüne indirilmiştir. Dünya kaotik, renkli ve aldatıcıdır. Kalabalık caddeler, geçici sevinçler ve bitmeyen arayışlar arasında insan savrulur.",
				style: {},
			},
			{
				header: "Scene 3",
				paragraph:
					"İnsan yeryüzüne indirilmiştir. Dünya kaotik, renkli ve aldatıcıdır. Kalabalık caddeler, geçici sevinçler ve bitmeyen arayışlar arasında insan savrulur.",
				style: {},
			},
		];

		const {
			currentIndex,
			currentHeader,
			currentParagraph,
			currentStyle,
			currentProgress,
		} = useScrollTimeline(scenes);

		const { splitProgress, videoSplitStyle, textSplitStyle } =
			useSplitAnimation(currentProgress, isMobile);

		watch(currentProgress, (val) => {
			updateIsScrolling();

			if (videoFramePlayer.value) {
				videoFramePlayer.value.updateFrame(val);
			}
		});

		const updateIsScrolling = () => {
			isScrolling.value = true;
			clearTimeout(isScrollingTimerId);
			isScrollingTimerId = setTimeout(() => {
				isScrolling.value = false;
			}, 600);
		};

		return {
			loading,
			videoFramePlayer,
			currentProgress,
			currentIndex,
			currentHeader,
			currentParagraph,
			currentStyle,
			videoFrameW,
			videoFrameH,
			isScrolling,
			scrollHeight,
			splitProgress,
			videoSplitStyle,
			textSplitStyle,
			tickets,
		};
	},
};
</script>

<style>
.v-enter-active,
.v-leave-active {
	transition: opacity 1s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}

.contain-layout {
	contain: layout style;
}
</style>
