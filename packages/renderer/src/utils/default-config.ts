import type { ClusterConfig, ClusterConfigOptions } from 'dst'
import { ClusterOptionsType } from '../types/dst'

export const defaultClusterConfig: ClusterConfig = {
  GAMEPLAY: {
    game_mode: 'survival',
    max_players: 6,
    pvp: false,
    pause_when_empty: true,
  },
  NETWORK: {
    lan_only_cluster: false,
    cluster_intention: 'cooperative',
    // cluster_password: ''
    cluster_description: 'DST Cloud Manage Generate',
    cluster_name: 'DST Cloud Manage',
    offline_cluster: false,
    cluster_language: 'zh',
  },
  MISC: {
    console_enabled: true,
  },
  SHARD: {
    shard_enabled: true,
    bind_ip: '127.0.0.1',
    master_ip: '127.0.0.1',
    master_port: 10888,
    cluster_key: 'defaultPass',
  },
}
export const defaultClusterMasterServer: ClusterConfig = {
  NETWORK: {
    server_port: 10999,
  },
  SHARD: {
    is_master: true,
  },
  ACCOUNT: {
    encode_user_path: true,
  },
}
export const defaultClusterCavesServer: ClusterConfig = {
  NETWORK: {
    server_port: 10998,
  },
  SHARD: {
    is_master: false,
    name: 'Caves',
  },
  STEAM: {
    master_server_port: 27017,
    authentication_port: 8767,
  },
}

export const clusterConfigOptions: ClusterConfigOptions = {
  GAMEPLAY: {
    game_mode: {
      type: ClusterOptionsType.SELECT,
      options: [
        'survival',
        'endless',
        'wilderness',
      ],
    },
    pvp: {
      type: ClusterOptionsType.SWITCH,
    },
    pause_when_empty: {
      type: ClusterOptionsType.SWITCH,
    },
  },
  NETWORK: {
    cluster_intention: {
      type: ClusterOptionsType.SELECT,
      options: [
        'cooperative',
        'competitive',
        'social',
        'madness',
      ],
    },
    lan_only_cluster: {
      type: ClusterOptionsType.SWITCH,
    },
    offline_cluster: {
      type: ClusterOptionsType.SWITCH,
    },
  },
  MISC: {
    console_enabled: {
      type: ClusterOptionsType.SWITCH,
    },
  },
  SHARD: {
    shard_enabled: {
      type: ClusterOptionsType.SWITCH,
    },
  },
}
export const clusterMasterServerOptions: ClusterConfigOptions = {
  SHARD: {
    is_master: {
      type: ClusterOptionsType.SWITCH,
    },
  },
  ACCOUNT: {
    encode_user_path: {
      type: ClusterOptionsType.SWITCH,
    },
  },
}
export const clusterCavesServerOptions: ClusterConfigOptions = {
  SHARD: {
    is_master: {
      type: ClusterOptionsType.SWITCH,
    },
  },
}
