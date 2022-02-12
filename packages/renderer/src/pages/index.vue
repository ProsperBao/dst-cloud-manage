<template>
    <div>
        {{ t('button.hello') }}
        <n-button>naive-ui</n-button>
    </div>
</template>

<script lang="ts" setup>
const {t} = useI18n();
</script>