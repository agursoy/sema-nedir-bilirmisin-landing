<template>
	<div class="bg-snb-bg-default">
		<Transition>
			<div v-show="loading">
				<loading :video-frame-w="videoFrameW" :video-frame-h="videoFrameH" />
			</div>
		</Transition>
		<Transition>
			<div
				v-show="!loading"
				class="scroll-container h-screen overflow-y-scroll"
			>
				<div
					ref="bgRef"
					class="fixed top-0 left-0 w-full h-full pointer-events-none z-30"
					:style="currentStyle"
				></div>
				<div class="relative h-[1000vh]">
					<div class="sticky top-1/2 -translate-y-1/2 w-ful">
						<div class="flex flex-row flex-wrap gap-12 justify-center">
							<div id="video">
								<video-frame-player
									:canvas_w="videoFrameW"
									:canvas_h="videoFrameH"
									ref="videoFramePlayer"
									@preload-completed="loading = false"
								/>
							</div>
							<div id="text" class="w-96 relative -mt-96 md:-mt-0 md:ml-0 p-5">
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
								<div class="absolute bottom-5 flex flex-row items-center gap-3">
									<span class="text-snb-text-default"
										>Sayfayı kaydırmaya devam edin</span
									>
									<scroll-down-icon :width="'20'" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script>
import { useScrollTimeline } from "./composables/useScrollTimeline.js";
import VideoFramePlayer from "./components/VideoFramePlayer.vue";
import Loading from "./components/Loading.vue";
import ScrollDownIcon from "./components/ScrollDownIcon.vue";

import { watch, ref } from "vue";

export default {
	components: {
		VideoFramePlayer,
		Loading,
		ScrollDownIcon,
	},
	setup() {
		const videoFramePlayer = ref(null);
		const loading = ref(false);

		const videoFrameW = ref(720);
		const videoFrameH = ref(405);

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

		watch(currentProgress, (val) => {
			if (videoFramePlayer.value) {
				videoFramePlayer.value.updateFrame(val);
			}
		});

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
		};
	},
};
</script>

<style>
.v-enter-active,
.v-leave-active {
	transition: opacity 3s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>
