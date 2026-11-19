import {
    IconBook2,
    IconDroplet,
    IconHeartbeat,
    IconHomeHeart,
    IconSparkles,
    IconTools,
    IconUsersGroup,
} from "@tabler/icons-react";
import type { ActivityIconKey } from "@/features/activities/data/activities";

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

export const ACTIVITY_ICONS: Record<ActivityIconKey, IconComponent> = {
    droplet: IconDroplet,
    sparkles: IconSparkles,
    home: IconHomeHeart,
    tools: IconTools,
    book: IconBook2,
    heartbeat: IconHeartbeat,
    users: IconUsersGroup,
};
