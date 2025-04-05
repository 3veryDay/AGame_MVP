const AI_MODES = {
  healthyStudy: {
    name: "헬씨 스터디",
    description: "앉아만 있으면 뇌순환이 멈춰! 한번씩 일어나서 스쿼트! ",
    playlists: [
      { tag: "white_noise", time: 1500 }, // 25분
      { tag: "pop", time: 300 }, // 5분
    ],
  },
  workout: {
    name: "운동",
    description: "인터벌 운동으로 효과적인 운동",
    playlists: [
      { tag: "kpop_chill", time: 180 },
      { tag: "rock_intense", time: 120 },
    ],
  },
  efficientWork: {
    name: "효율적인 작업",
    description: "똑같은 작업을 계속 하면 비효율적이야. 의도적으로 휴식을 가져",
    playlists: [
      { tag: "pop", time: 3000 },
      { tag: "kpop", time: 600 },
    ],
  },
};
