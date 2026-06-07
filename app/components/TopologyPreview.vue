<template>
  <div class="rounded-xl border border-default bg-elevated overflow-hidden shadow-lg select-none">
    <!-- Mini toolbar -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-default bg-default">
      <span class="text-xs font-mono text-muted">E-Commerce Peak Traffic</span>
      <div class="flex items-center gap-2">
        <UBadge
          color="success"
          variant="subtle"
        >
          99.2% avail
        </UBadge>
        <UBadge
          color="warning"
          variant="subtle"
        >
          184ms P95
        </UBadge>
        <UBadge
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
          <!-- Normal edge arrow -->
          <marker
            id="tp-arrow"
            markerWidth="6"
            markerHeight="5"
            refX="6"
            refY="2.5"
            orient="auto"
          >
            <path
              d="M 0 0 L 6 2.5 L 0 5 z"
              fill="var(--ui-text-muted)"
              opacity="0.6"
            />
          </marker>
          <!-- Primary edge arrow -->
          <marker
            id="tp-arrow-primary"
            markerWidth="6"
            markerHeight="5"
            refX="6"
            refY="2.5"
            orient="auto"
          >
            <path
              d="M 0 0 L 6 2.5 L 0 5 z"
              fill="var(--ui-primary)"
            />
          </marker>
        </defs>

        <rect
          width="420"
          height="290"
          fill="url(#tp-grid)"
        />

        <!-- Edges -->
        <line
          x1="210"
          y1="52"
          x2="210"
          y2="94"
          stroke="var(--ui-text-muted)"
          stroke-width="1.5"
          opacity="0.4"
          marker-end="url(#tp-arrow)"
        />
        <line
          x1="172"
          y1="131"
          x2="107"
          y2="174"
          stroke="var(--ui-text-muted)"
          stroke-width="1.5"
          opacity="0.4"
          marker-end="url(#tp-arrow)"
        />
        <line
          x1="248"
          y1="131"
          x2="323"
          y2="174"
          stroke="var(--ui-text-muted)"
          stroke-width="1.5"
          opacity="0.4"
          marker-end="url(#tp-arrow)"
        />
        <line
          x1="93"
          y1="211"
          x2="185"
          y2="251"
          stroke="var(--ui-text-muted)"
          stroke-width="1.5"
          opacity="0.4"
          marker-end="url(#tp-arrow)"
        />
        <line
          x1="327"
          y1="211"
          x2="240"
          y2="251"
          stroke="var(--ui-text-muted)"
          stroke-width="1.5"
          opacity="0.4"
          marker-end="url(#tp-arrow)"
        />
        <!-- Redis Cache edge (improvement) -->
        <line
          x1="338"
          y1="211"
          x2="352"
          y2="251"
          stroke="var(--ui-primary)"
          stroke-width="1.5"
          stroke-dasharray="4 3"
          marker-end="url(#tp-arrow-primary)"
          opacity="0.8"
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
        <g
          transform="translate(204, 21) scale(0.5)"
          stroke="var(--ui-text-muted)"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        >
          <path d="M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm4 15h10m-8-4v4m6-4v4" />
        </g>
        <text
          x="210"
          y="45"
          text-anchor="middle"
          font-size="10"
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
        <g
          transform="translate(204, 98) scale(0.5)"
          stroke="var(--ui-primary)"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        >
          <path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21A12 12 0 0 1 3.5 6A12 12 0 0 0 12 3" />
        </g>
        <text
          x="210"
          y="123"
          text-anchor="middle"
          font-size="10"
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
        <g
          transform="translate(87, 178) scale(0.5)"
          stroke="var(--ui-text-muted)"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        >
          <path d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
          <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0-2 0m-3-5V7a4 4 0 1 1 8 0v4" />
        </g>
        <text
          x="93"
          y="203"
          text-anchor="middle"
          font-size="10"
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
        <g
          transform="translate(329, 178) scale(0.5)"
          stroke="var(--ui-text-muted)"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        >
          <path d="M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3m0 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm4-7v.01M7 16v.01" />
        </g>
        <text
          x="335"
          y="203"
          text-anchor="middle"
          font-size="10"
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
        <g
          transform="translate(204, 255) scale(0.5)"
          stroke="var(--ui-text-muted)"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        >
          <path d="M4 6a8 3 0 1 0 16 0A8 3 0 1 0 4 6" />
          <path d="M4 6v6a8 3 0 0 0 16 0V6" />
          <path d="M4 12v6a8 3 0 0 0 16 0v-6" />
        </g>
        <text
          x="210"
          y="278"
          text-anchor="middle"
          font-size="10"
          font-family="inherit"
          fill="var(--ui-text-muted)"
        >PostgreSQL</text>

        <!-- Redis Cache node (applied improvement) -->
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
        />
        <g
          transform="translate(354, 255) scale(0.5)"
          stroke="var(--ui-primary)"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        >
          <path d="M13 3v7h6l-8 11v-7H5z" />
        </g>
        <text
          x="360"
          y="278"
          text-anchor="middle"
          font-size="10"
          font-family="inherit"
          fill="var(--ui-primary)"
        >Redis Cache</text>
      </svg>

      <!-- Applied improvement label -->
      <div class="absolute bottom-3 left-3">
        <UBadge
          color="primary"
          variant="soft"
          icon="i-tabler-circle-plus"
        >
          Cache added
        </UBadge>
      </div>
    </div>
  </div>
</template>
