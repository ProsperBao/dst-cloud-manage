<template>
  <main class="text-gray-700 dark:text-gray-200">
    <header class="flex justify-between items-center pt-2 px-5 pb-2 bg-light-300 dark:text-gray-700 opacity-95 bg-white shadow-md shadow-black/5 dark:(bg-d-gray-6 shadow-md shadow-l-gray/10)">
      <h1 class="text-2xl">
        FuBao
      </h1>
      <TopControl />
    </header>
    <section class="min-h-80vh px-7 py-10">
      <router-view />
    </section>
    <Footer />
  </main>
  <ClientOnly>
    <BackgroundGalaxy />
  </ClientOnly>
</template>
