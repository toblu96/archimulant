<template>
  <div class="rounded-xl border border-default bg-elevated overflow-hidden shadow-lg select-none">
    <!-- Mini toolbar -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-default bg-default">
      <span class="text-xs font-mono text-muted">e-commerce-api</span>
      <div class="flex items-center gap-2">
        <UBadge
          size="xs"
          color="success"
          variant="soft"
        >
          99.2% avail
        </UBadge>
        <UBadge
          size="xs"
          color="warning"
          variant="soft"
        >
          184ms P95
        </UBadge>
        <UBadge
          size="xs"
          color="neutral"
          variant="subtle"
        >
          $2.4k / $3k
        </UBadge>
      </div>
    </div>

    <!-- Canvas -->
    <div class="relative">
      <svg
        viewBox="0 0 420 290"
        xmlns="http://www.w3.org/2000/svg"
        class="w-full"
        aria-hidden="true"
      >
        <!-- Grid background -->
        <defs>
          <pattern
            id="tp-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="var(--ui-border)"
              stroke-width="0.4"
              opacity="0.5"
            />
          </pattern>
          <marker
            id="tp-arrow"
            markerWidth="5"
            markerHeight="4"
            refX="5"
            refY="2"
            orient="auto"
          >
            <path
              d="M 0 0 L 5 2 L 0 4 z"
              fill="var(--ui-border)"
            />
          </marker>
        </defs>
        <rect
          width="420"
          height="290"
          fill="url(#tp-grid)"
        />

        <!-- Edges -->
        <!-- Client → API Gateway -->
        <line
          x1="210"
          y1="52"
          x2="210"
          y2="95"
          stroke="var(--ui-border)"
          stroke-width="1.5"
          marker-end="url(#tp-arrow)"
        />
        <!-- API Gateway → Auth Service -->
        <line
          x1="172"
          y1="131"
          x2="105"
          y2="175"
          stroke="var(--ui-border)"
          stroke-width="1.5"
          marker-end="url(#tp-arrow)"
        />
        <!-- API Gateway → Product Service -->
        <line
          x1="248"
          y1="131"
          x2="315"
          y2="175"
          stroke="var(--ui-border)"
          stroke-width="1.5"
          marker-end="url(#tp-arrow)"
        />
        <!-- Auth Service → PostgreSQL -->
        <line
          x1="93"
          y1="214"
          x2="182"
          y2="252"
          stroke="var(--ui-border)"
          stroke-width="1.5"
          marker-end="url(#tp-arrow)"
        />
        <!-- Product Service → PostgreSQL -->
        <line
          x1="327"
          y1="214"
          x2="238"
          y2="252"
          stroke="var(--ui-border)"
          stroke-width="1.5"
          marker-end="url(#tp-arrow)"
        />
        <!-- Product Service → Redis Cache -->
        <line
          x1="340"
          y1="214"
          x2="355"
          y2="252"
          stroke="var(--ui-primary)"
          stroke-width="1.5"
          stroke-dasharray="4 3"
          marker-end="url(#tp-arrow)"
          opacity="0.7"
        />

        <!-- Client node -->
        <rect
          x="170"
          y="18"
          width="80"
          height="34"
          rx="7"
          fill="var(--ui-bg)"
          stroke="var(--ui-border)"
          stroke-width="1"
        />
        <text
          x="210"
          y="36"
          text-anchor="middle"
          font-size="10"
          font-family="inherit"
          fill="var(--ui-text-muted)"
        >🖥</text>
        <text
          x="210"
          y="47"
          text-anchor="middle"
          font-size="9"
          font-family="inherit"
          fill="var(--ui-text-muted)"
        >Client</text>

        <!-- API Gateway node (primary highlight) -->
        <rect
          x="150"
          y="95"
          width="120"
          height="36"
          rx="7"
          fill="var(--ui-bg)"
          stroke="var(--ui-primary)"
          stroke-width="1.5"
        />
        <text
          x="210"
          y="113"
          text-anchor="middle"
          font-size="10"
          font-family="inherit"
          fill="var(--ui-text)"
        >⚡</text>
        <text
          x="210"
          y="124"
          text-anchor="middle"
          font-size="9"
          font-family="inherit"
          fill="var(--ui-text)"
        >API Gateway</text>

        <!-- Auth Service node -->
        <rect
          x="43"
          y="175"
          width="100"
          height="36"
          rx="7"
          fill="var(--ui-bg)"
          stroke="var(--ui-border)"
          stroke-width="1"
        />
        <text
          x="93"
          y="193"
          text-anchor="middle"
          font-size="10"
          font-family="inherit"
          fill="var(--ui-text-muted)"
        >🔐</text>
        <text
          x="93"
          y="204"
          text-anchor="middle"
          font-size="9"
          font-family="inherit"
          fill="var(--ui-text-muted)"
        >Auth Service</text>

        <!-- Product Service node -->
        <rect
          x="278"
          y="175"
          width="115"
          height="36"
          rx="7"
          fill="var(--ui-bg)"
          stroke="var(--ui-border)"
          stroke-width="1"
        />
        <text
          x="335"
          y="193"
          text-anchor="middle"
          font-size="10"
          font-family="inherit"
          fill="var(--ui-text-muted)"
        >📦</text>
        <text
          x="335"
          y="204"
          text-anchor="middle"
          font-size="9"
          font-family="inherit"
          fill="var(--ui-text-muted)"
        >Product Service</text>

        <!-- PostgreSQL node -->
        <rect
          x="168"
          y="252"
          width="84"
          height="34"
          rx="7"
          fill="var(--ui-bg)"
          stroke="var(--ui-border)"
          stroke-width="1"
        />
        <text
          x="210"
          y="269"
          text-anchor="middle"
          font-size="10"
          font-family="inherit"
          fill="var(--ui-text-muted)"
        >🗄</text>
        <text
          x="210"
          y="280"
          text-anchor="middle"
          font-size="9"
          font-family="inherit"
          fill="var(--ui-text-muted)"
        >PostgreSQL</text>

        <!-- Redis Cache node (applied improvement — highlighted) -->
        <rect
          x="318"
          y="252"
          width="84"
          height="34"
          rx="7"
          fill="var(--ui-bg)"
          stroke="var(--ui-primary)"
          stroke-width="1.5"
          stroke-dasharray="4 3"
          opacity="0.85"
        />
        <text
          x="360"
          y="269"
          text-anchor="middle"
          font-size="10"
          font-family="inherit"
          fill="var(--ui-primary)"
          opacity="0.85"
        >⚡</text>
        <text
          x="360"
          y="280"
          text-anchor="middle"
          font-size="9"
          font-family="inherit"
          fill="var(--ui-primary)"
          opacity="0.85"
        >Redis Cache</text>
      </svg>

      <!-- Applied improvement label -->
      <div class="absolute bottom-3 left-3 flex items-center gap-1.5">
        <UBadge
          size="xs"
          color="primary"
          variant="soft"
          icon="i-lucide-plus-circle"
        >
          Cache added
        </UBadge>
      </div>
    </div>
  </div>
</template>
