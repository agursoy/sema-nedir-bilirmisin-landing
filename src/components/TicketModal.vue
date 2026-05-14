<template>
	<div
		class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-[60] pointer-events-none w-full"
		v-show="progress > 0"
	>
		<div
			class="bg-snb-bg-default border-2 border-[#eceee2]/20 p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center gap-6"
			:style="{
				opacity: progress,
				transform: `scale(${0.9 + progress * 0.1})`,
				pointerEvents: progress > 0.8 ? 'auto' : 'none'
			}"
		>
			<h3 class="text-3xl md:text-5xl text-snb-text-default font-clean font-bold text-center">
				Mukabeleye Davetlisiniz
			</h3>
			<p class="text-snb-text-default/80 text-lg md:text-xl text-center max-w-lg font-clean">
				Sema'nın sırrına ortak olmak ve bu benzersiz deneyimi canlı yaşamak için biletinizi hemen alabilirsiniz.
			</p>
			<div class="flex flex-col gap-4 mt-4 w-full">
				<a
					v-for="(ticket, index) in tickets"
					:key="index"
					:href="ticket.url"
					target="_blank"
					class="w-full text-center bg-snb-text-default text-snb-bg-default px-8 py-4 rounded-full font-bold text-base md:text-xl hover:scale-105 transition-transform"
				>
					{{ ticket.label }}
				</a>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		progress: Number,
		tickets: {
			type: Array,
			default: () => [],
		},
	},
};
</script>
