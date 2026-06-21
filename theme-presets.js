window.CATEGORY_KEYS = ["감정", "이미지", "행동", "시공간", "영어 키워드"];

window.GENRE_LIBRARY = {
  ballad: "Ballad",
  rnb: "R&B",
  alt_pop: "Alt Pop",
  dream_pop: "Dream Pop",
  indie_rock: "Indie Rock",
  ambient: "Ambient",
  trip_hop: "Trip Hop",
  house: "House",
  techno: "Techno",
  drum_and_bass: "Drum & Bass",
  folk_pop: "Folk Pop",
  cinematic_pop: "Cinematic Pop",
  acoustic_pop: "Acoustic Pop",
  synthwave: "Synthwave",
  post_rock: "Post Rock",
  neo_soul: "Neo Soul",
  lofi_hiphop: "Lo-fi Hip Hop",
  piano_pop: "Piano Pop",
  indie_pop: "Indie Pop",
  electronic_pop: "Electronic Pop"
};

window.BPM_LIBRARY = {
  free_or_very_slow: "Free / Very Slow",
  slow_60_75: "60-75 BPM",
  slow_mid_76_90: "76-90 BPM",
  mid_91_105: "91-105 BPM",
  mid_up_106_120: "106-120 BPM",
  up_121_135: "121-135 BPM",
  fast_136_150: "136-150 BPM",
  very_fast_160_180: "160-180 BPM"
};

window.THEME_BUTTON_ORDER = [
  "love",
  "breakup",
  "happiness",
  "sadness",
  "hope",
  "despair",
  "peace",
  "anger",
  "anxiety",
  "growth",
  "nostalgia",
  "meeting",
  "parting",
  "beginning",
  "ending",
  "friendship",
  "betrayal",
  "truth",
  "deception",
  "celebration",
  "mourning",
  "victory",
  "defeat",
  "night_darkness",
  "journey",
  "solitude",
  "freedom",
  "confinement",
  "challenge",
  "giving_up"
];


window.THEME_PRESETS = {
  love: {
    id: "love",
    label: "사랑",
    labelEn: "Love",
    recommendations: {
      genres: [
        { genreId: "rnb", weight: 4, reason: "가까운 감정선과 보컬 중심 전개에 잘 어울림" },
        { genreId: "ballad", weight: 4, reason: "직접적인 감정 전달과 서사 표현에 유리함" },
        { genreId: "dream_pop", weight: 3, reason: "몽환적이고 부드러운 사랑의 분위기 표현에 적합함" },
        { genreId: "acoustic_pop", weight: 2, reason: "따뜻하고 친밀한 질감에 잘 맞음" }
      ],
      bpms: [
        { bpmId: "slow_mid_76_90", weight: 4, reason: "감정선이 자연스럽게 살아나는 중저속 템포" },
        { bpmId: "mid_91_105", weight: 3, reason: "대중적인 팝 발라드/알앤비 확장에 적합함" },
        { bpmId: "slow_60_75", weight: 2, reason: "더 진하고 느린 사랑 노선에 어울림" }
      ]
    }
  },

  breakup: {
    id: "breakup",
    label: "이별",
    labelEn: "Breakup",
    recommendations: {
      genres: [
        { genreId: "ballad", weight: 5, reason: "이별의 직접적인 정서 전달에 가장 적합함" },
        { genreId: "piano_pop", weight: 3, reason: "말하듯 담백한 슬픔과 독백 구조에 유리함" },
        { genreId: "dream_pop", weight: 2, reason: "잔향과 공허함을 몽환적으로 표현하기 좋음" },
        { genreId: "ambient", weight: 2, reason: "고요한 상실감과 여백을 강조할 수 있음" }
      ],
      bpms: [
        { bpmId: "slow_60_75", weight: 4, reason: "깊은 여운과 느린 감정 전달에 적합함" },
        { bpmId: "slow_mid_76_90", weight: 4, reason: "대중적인 이별 발라드 흐름과 잘 맞음" },
        { bpmId: "mid_91_105", weight: 1, reason: "리듬이 있는 이별 팝/알앤비로 확장 가능함" }
      ]
    }
  },

  happiness: {
    id: "happiness",
    label: "행복",
    labelEn: "Happiness",
    recommendations: {
      genres: [
        { genreId: "indie_pop", weight: 4, reason: "가볍고 밝은 정서 전달에 적합함" },
        { genreId: "electronic_pop", weight: 3, reason: "반짝이고 활기찬 질감 표현에 좋음" },
        { genreId: "acoustic_pop", weight: 3, reason: "자연스럽고 포근한 행복감을 담기 좋음" },
        { genreId: "house", weight: 2, reason: "고양감이 큰 행복/축제 계열에 어울림" }
      ],
      bpms: [
        { bpmId: "mid_up_106_120", weight: 4, reason: "경쾌하지만 과하지 않은 밝은 흐름" },
        { bpmId: "up_121_135", weight: 3, reason: "더 적극적이고 리드미컬한 행복감에 적합함" },
        { bpmId: "mid_91_105", weight: 2, reason: "따뜻한 인디/팝 계열로 무난함" }
      ]
    }
  },

  sadness: {
    id: "sadness",
    label: "슬픔",
    labelEn: "Sadness",
    recommendations: {
      genres: [
        { genreId: "ballad", weight: 5, reason: "슬픔의 직접적인 전달력에 강함" },
        { genreId: "ambient", weight: 3, reason: "고요하고 텅 빈 정서를 살릴 수 있음" },
        { genreId: "piano_pop", weight: 3, reason: "말하듯 담담한 슬픔과 잘 맞음" },
        { genreId: "cinematic_pop", weight: 2, reason: "장면감 있는 큰 슬픔에 적합함" }
      ],
      bpms: [
        { bpmId: "slow_60_75", weight: 4, reason: "깊고 무거운 슬픔의 기본 구간" },
        { bpmId: "slow_mid_76_90", weight: 3, reason: "보편적인 감성 발라드 전개에 적합함" },
        { bpmId: "free_or_very_slow", weight: 1, reason: "극도로 절제된 정서에 사용 가능" }
      ]
    }
  },

  hope: {
    id: "hope",
    label: "희망",
    labelEn: "Hope",
    recommendations: {
      genres: [
        { genreId: "cinematic_pop", weight: 4, reason: "점진적으로 커지는 상승감을 살리기 좋음" },
        { genreId: "indie_pop", weight: 3, reason: "가벼운 희망, 일상적 회복에 적합함" },
        { genreId: "acoustic_pop", weight: 3, reason: "따뜻하고 담백한 희망의 정서에 어울림" },
        { genreId: "post_rock", weight: 2, reason: "서서히 넓어지는 감정선 전개에 유리함" }
      ],
      bpms: [
        { bpmId: "mid_91_105", weight: 4, reason: "희망이 점차 살아나는 전개에 적합함" },
        { bpmId: "mid_up_106_120", weight: 3, reason: "더 분명한 추진력과 밝기를 줄 수 있음" },
        { bpmId: "slow_mid_76_90", weight: 2, reason: "잔잔한 회복 서사에 적합함" }
      ]
    }
  },

  despair: {
    id: "despair",
    label: "절망",
    labelEn: "Despair",
    recommendations: {
      genres: [
        { genreId: "ambient", weight: 4, reason: "무기력과 깊은 공허를 표현하기 좋음" },
        { genreId: "trip_hop", weight: 3, reason: "가라앉은 리듬과 어두운 질감이 어울림" },
        { genreId: "ballad", weight: 2, reason: "절망의 독백적 감정 표현에 적합함" },
        { genreId: "cinematic_pop", weight: 2, reason: "극적인 절망 서사 확장에 유리함" }
      ],
      bpms: [
        { bpmId: "slow_60_75", weight: 4, reason: "무겁고 가라앉은 감정선에 적합함" },
        { bpmId: "slow_mid_76_90", weight: 3, reason: "현대적인 감성 곡 흐름에 어울림" },
        { bpmId: "free_or_very_slow", weight: 1, reason: "정지된 듯한 절망 표현에 사용 가능" }
      ]
    }
  },

  peace: {
    id: "peace",
    label: "평온",
    labelEn: "Peace",
    recommendations: {
      genres: [
        { genreId: "ambient", weight: 4, reason: "고요한 공간감과 정적인 숨결을 표현하기 좋음" },
        { genreId: "acoustic_pop", weight: 3, reason: "편안하고 자연스러운 정서에 적합함" },
        { genreId: "neo_soul", weight: 2, reason: "부드럽고 여유로운 그루브를 줄 수 있음" },
        { genreId: "dream_pop", weight: 2, reason: "잔잔한 부유감과 잘 맞음" }
      ],
      bpms: [
        { bpmId: "slow_mid_76_90", weight: 4, reason: "가장 무난한 평온 계열 구간" },
        { bpmId: "slow_60_75", weight: 3, reason: "더 느리고 명상적인 분위기에 적합함" },
        { bpmId: "mid_91_105", weight: 1, reason: "조용한 리듬감을 추가하고 싶을 때 적합함" }
      ]
    }
  },

  anger: {
    id: "anger",
    label: "분노",
    labelEn: "Anger",
    recommendations: {
      genres: [
        { genreId: "indie_rock", weight: 4, reason: "직선적인 에너지와 공격성을 살리기 좋음" },
        { genreId: "techno", weight: 3, reason: "밀어붙이는 압력과 긴장감을 주기 쉬움" },
        { genreId: "drum_and_bass", weight: 3, reason: "폭발적 추진력과 불안정한 속도감에 적합함" },
        { genreId: "electronic_pop", weight: 1, reason: "대중적이면서 날카로운 감정 처리 가능" }
      ],
      bpms: [
        { bpmId: "fast_136_150", weight: 4, reason: "강한 추진력과 분출감을 살리기 좋음" },
        { bpmId: "up_121_135", weight: 3, reason: "록/일렉 기반의 공격적 템포로 적합함" },
        { bpmId: "very_fast_160_180", weight: 2, reason: "극단적인 격앙 상태를 표현할 때 적합함" }
      ]
    }
  },

  anxiety: {
    id: "anxiety",
    label: "불안",
    labelEn: "Anxiety",
    recommendations: {
      genres: [
        { genreId: "trip_hop", weight: 4, reason: "긴장과 음울함이 공존하는 리듬에 적합함" },
        { genreId: "ambient", weight: 3, reason: "텅 빈 공간감과 심리적 압박을 표현할 수 있음" },
        { genreId: "drum_and_bass", weight: 2, reason: "조급하고 흔들리는 에너지에 어울림" },
        { genreId: "synthwave", weight: 2, reason: "야간 도시형 긴장감에 적합함" }
      ],
      bpms: [
        { bpmId: "mid_91_105", weight: 4, reason: "서서히 조여오는 불안의 전개에 적합함" },
        { bpmId: "slow_mid_76_90", weight: 3, reason: "내면적 불안과 독백에 잘 맞음" },
        { bpmId: "up_121_135", weight: 1, reason: "초조함이 높은 상태에 사용 가능함" }
      ]
    }
  },

  growth: {
    id: "growth",
    label: "성장",
    labelEn: "Growth",
    recommendations: {
      genres: [
        { genreId: "cinematic_pop", weight: 4, reason: "서사적인 전개와 확장을 표현하기 좋음" },
        { genreId: "indie_pop", weight: 3, reason: "일상적 성장과 변화의 정서를 담기 적합함" },
        { genreId: "post_rock", weight: 3, reason: "점진적 빌드업과 큰 감정 확장에 유리함" },
        { genreId: "acoustic_pop", weight: 2, reason: "담백하고 진솔한 성장의 느낌을 살리기 좋음" }
      ],
      bpms: [
        { bpmId: "mid_91_105", weight: 4, reason: "자연스러운 전진감과 균형감이 있음" },
        { bpmId: "mid_up_106_120", weight: 3, reason: "더 적극적이고 활기찬 성장 서사에 적합함" },
        { bpmId: "slow_mid_76_90", weight: 1, reason: "잔잔한 회고형 성장 서사에도 사용 가능함" }
      ]
    }
  },

  nostalgia: {
    id: "nostalgia",
    label: "회상",
    labelEn: "Nostalgia",
    recommendations: {
      genres: [
        { genreId: "dream_pop", weight: 4, reason: "희미한 기억과 잔향을 표현하기 좋음" },
        { genreId: "folk_pop", weight: 4, reason: "가까운 기억과 인간적인 온기를 담기 좋음" },
        { genreId: "ballad", weight: 3, reason: "직접적인 회상 감정 전달에 유리함" },
        { genreId: "ambient", weight: 2, reason: "흐릿한 장면과 시간 정지를 표현하기 좋음" },
        { genreId: "cinematic_pop", weight: 2, reason: "기억의 장면감과 서사 확장에 유리함" }
      ],
      bpms: [
        { bpmId: "slow_mid_76_90", weight: 5, reason: "회상 특유의 느린 흐름과 잘 맞음" },
        { bpmId: "slow_60_75", weight: 2, reason: "더 깊고 고요한 향수에 적합함" },
        { bpmId: "mid_91_105", weight: 2, reason: "대중적인 회상 팝으로 확장 가능함" }
      ]
    }
  },

  meeting: {
    id: "meeting",
    label: "만남",
    labelEn: "Meeting",
    recommendations: {
      genres: [
        { genreId: "indie_pop", weight: 4, reason: "설렘과 가벼운 움직임을 표현하기 좋음" },
        { genreId: "rnb", weight: 2, reason: "가까워지는 감정선에 잘 어울림" },
        { genreId: "acoustic_pop", weight: 3, reason: "따뜻하고 친근한 느낌에 적합함" }
      ],
      bpms: [
        { bpmId: "mid_91_105", weight: 4, reason: "자연스럽게 흘러가는 설렘에 적합함" },
        { bpmId: "mid_up_106_120", weight: 2, reason: "조금 더 밝고 경쾌한 만남의 정서에 어울림" },
        { bpmId: "slow_mid_76_90", weight: 1, reason: "잔잔한 첫 만남 분위기에도 사용 가능함" }
      ]
    }
  },

  parting: {
    id: "parting",
    label: "헤어짐",
    labelEn: "Parting",
    recommendations: {
      genres: [
        { genreId: "ballad", weight: 4, reason: "헤어짐의 직접적인 감정 표현에 적합함" },
        { genreId: "ambient", weight: 2, reason: "남겨진 공기와 여백을 살리기 좋음" },
        { genreId: "dream_pop", weight: 2, reason: "서서히 멀어지는 잔상을 표현할 수 있음" }
      ],
      bpms: [
        { bpmId: "slow_60_75", weight: 3, reason: "무거운 작별의 보편적 템포" },
        { bpmId: "slow_mid_76_90", weight: 3, reason: "감성 팝/발라드 계열에 넓게 맞음" },
        { bpmId: "mid_91_105", weight: 1, reason: "다소 담담하게 흘러가는 작별에도 적합함" }
      ]
    }
  },

  beginning: {
    id: "beginning",
    label: "시작",
    labelEn: "Beginning",
    recommendations: {
      genres: [
        { genreId: "indie_pop", weight: 3, reason: "가볍고 새로운 출발감에 적합함" },
        { genreId: "cinematic_pop", weight: 3, reason: "서막이 열리는 장면감에 유리함" },
        { genreId: "acoustic_pop", weight: 2, reason: "담백한 시작의 감성에 적합함" }
      ],
      bpms: [
        { bpmId: "mid_91_105", weight: 3, reason: "가장 균형 잡힌 출발 템포" },
        { bpmId: "mid_up_106_120", weight: 2, reason: "더 적극적인 시작과 도약감에 어울림" },
        { bpmId: "slow_mid_76_90", weight: 1, reason: "조용한 시작 서사에도 적합함" }
      ]
    }
  },

  ending: {
    id: "ending",
    label: "끝",
    labelEn: "Ending",
    recommendations: {
      genres: [
        { genreId: "cinematic_pop", weight: 4, reason: "결말의 장면감과 여운을 크게 만들 수 있음" },
        { genreId: "ballad", weight: 3, reason: "직접적 감정 정리에 적합함" },
        { genreId: "ambient", weight: 2, reason: "사라지는 감각과 잔여 여백을 표현하기 좋음" }
      ],
      bpms: [
        { bpmId: "slow_mid_76_90", weight: 3, reason: "정리와 마무리의 흐름에 무난함" },
        { bpmId: "slow_60_75", weight: 3, reason: "더 깊은 여운과 정지감을 줄 수 있음" },
        { bpmId: "mid_91_105", weight: 1, reason: "다짐형 엔딩에 적합함" }
      ]
    }
  },

  friendship: {
    id: "friendship",
    label: "우정",
    labelEn: "Friendship",
    recommendations: {
      genres: [
        { genreId: "indie_pop", weight: 4, reason: "편안하고 경쾌한 관계의 온도를 담기 좋음" },
        { genreId: "acoustic_pop", weight: 3, reason: "따뜻하고 소박한 우정 서사에 적합함" },
        { genreId: "indie_rock", weight: 2, reason: "청춘성 있는 에너지에 어울림" }
      ],
      bpms: [
        { bpmId: "mid_91_105", weight: 4, reason: "일상적인 친밀감과 가장 잘 맞음" },
        { bpmId: "mid_up_106_120", weight: 2, reason: "활동적이고 명랑한 우정 서사에 적합함" },
        { bpmId: "slow_mid_76_90", weight: 1, reason: "잔잔하고 추억형 우정 곡에도 어울림" }
      ]
    }
  },

  betrayal: {
    id: "betrayal",
    label: "배신",
    labelEn: "Betrayal",
    recommendations: {
      genres: [
        { genreId: "trip_hop", weight: 4, reason: "불신과 어두운 긴장을 표현하기 좋음" },
        { genreId: "ballad", weight: 3, reason: "배신의 상처를 직접적으로 전달하기 좋음" },
        { genreId: "indie_rock", weight: 2, reason: "날 선 분노와 상처를 드러내기 적합함" },
        { genreId: "ambient", weight: 1, reason: "허무와 붕괴된 관계의 공기를 만들 수 있음" }
      ],
      bpms: [
        { bpmId: "slow_mid_76_90", weight: 3, reason: "심리적 상처와 독백에 적합함" },
        { bpmId: "mid_91_105", weight: 3, reason: "긴장감을 유지한 감정 전개에 어울림" },
        { bpmId: "up_121_135", weight: 1, reason: "격한 분출형 전개로 확장 가능함" }
      ]
    }
  },

  night_darkness: {
    id: "night_darkness",
    label: "밤/어둠",
    labelEn: "Night / Darkness",
    recommendations: {
      genres: [
        { genreId: "synthwave", weight: 4, reason: "야간 도시, 네온, 고독한 움직임에 잘 맞음" },
        { genreId: "dream_pop", weight: 3, reason: "몽환적 밤의 공기와 잔상을 살리기 좋음" },
        { genreId: "trip_hop", weight: 3, reason: "어두운 긴장과 저속 리듬을 담기 적합함" },
        { genreId: "ambient", weight: 2, reason: "고요하고 깊은 어둠의 정적을 표현할 수 있음" }
      ],
      bpms: [
        { bpmId: "slow_mid_76_90", weight: 4, reason: "밤 특유의 느릿한 흐름과 잘 맞음" },
        { bpmId: "mid_91_105", weight: 3, reason: "도시 야간 드라이브 감성에 적합함" },
        { bpmId: "up_121_135", weight: 1, reason: "강한 야간 질주형 무드에 사용 가능함" }
      ]
    }
  },

  journey: {
    id: "journey",
    label: "여정",
    labelEn: "Journey",
    recommendations: {
      genres: [
        { genreId: "cinematic_pop", weight: 4, reason: "이동과 변화의 서사를 크게 담을 수 있음" },
        { genreId: "folk_pop", weight: 3, reason: "사람 냄새 나는 길 위의 감성에 적합함" },
        { genreId: "indie_rock", weight: 3, reason: "전진감과 추진력을 만들기 좋음" },
        { genreId: "synthwave", weight: 2, reason: "야간 이동/도로 감성에 어울림" }
      ],
      bpms: [
        { bpmId: "mid_91_105", weight: 3, reason: "걸음과 호흡이 자연스러운 여정 템포" },
        { bpmId: "mid_up_106_120", weight: 3, reason: "조금 더 분명한 추진력과 이동감에 적합함" },
        { bpmId: "up_121_135", weight: 1, reason: "질주형 여정 서사에 사용 가능함" }
      ]
    }
  },

  solitude: {
    id: "solitude",
    label: "고독",
    labelEn: "Solitude",
    recommendations: {
      genres: [
        { genreId: "ambient", weight: 4, reason: "넓은 여백과 혼자 남은 공간감을 만들기 좋음" },
        { genreId: "piano_pop", weight: 3, reason: "담담한 독백과 사적인 정서에 적합함" },
        { genreId: "dream_pop", weight: 2, reason: "떠도는 듯한 고독감을 살리기 좋음" },
        { genreId: "neo_soul", weight: 1, reason: "내밀하고 성숙한 외로움 표현에도 사용 가능함" }
      ],
      bpms: [
        { bpmId: "slow_60_75", weight: 4, reason: "고요하고 무거운 고독에 잘 맞음" },
        { bpmId: "slow_mid_76_90", weight: 3, reason: "현대 감성형 외로움 표현에 적합함" },
        { bpmId: "mid_91_105", weight: 1, reason: "걷는 듯한 외로움, 도심 독백에 적합함" }
      ]
    }
  },

  freedom: {
    id: "freedom",
    label: "자유",
    labelEn: "Freedom",
    recommendations: {
      genres: [
        { genreId: "indie_rock", weight: 4, reason: "해방감과 달려 나가는 에너지를 살리기 좋음" },
        { genreId: "house", weight: 3, reason: "몸이 열리는 듯한 리듬과 상승감에 적합함" },
        { genreId: "cinematic_pop", weight: 3, reason: "넓게 펼쳐지는 장면성과 해방감을 담기 좋음" },
        { genreId: "electronic_pop", weight: 2, reason: "현대적이고 밝은 자유의 에너지에 어울림" }
      ],
      bpms: [
        { bpmId: "mid_up_106_120", weight: 4, reason: "열리고 움직이는 자유의 감정선에 적합함" },
        { bpmId: "up_121_135", weight: 3, reason: "더 적극적인 질주감과 해방감에 좋음" },
        { bpmId: "fast_136_150", weight: 1, reason: "극단적인 폭발형 자유 표현에 사용 가능함" }
      ]
    }
  },

  confinement: {
    id: "confinement",
    label: "속박",
    labelEn: "Confinement",
    recommendations: {
      genres: [
        { genreId: "trip_hop", weight: 4, reason: "답답하고 눌린 심리를 저속 리듬으로 표현하기 좋음" },
        { genreId: "ambient", weight: 3, reason: "막혀 있는 공간감과 정지된 공기를 만들 수 있음" },
        { genreId: "techno", weight: 2, reason: "기계적 반복과 압박감을 줄 수 있음" },
        { genreId: "synthwave", weight: 1, reason: "차가운 야간 밀폐감에 어울림" }
      ],
      bpms: [
        { bpmId: "slow_mid_76_90", weight: 4, reason: "억눌림과 긴장을 균형 있게 담기 좋음" },
        { bpmId: "mid_91_105", weight: 2, reason: "심리적 압박이 지속되는 흐름에 적합함" },
        { bpmId: "up_121_135", weight: 1, reason: "압박이 커지는 불안정한 질주형에 가능함" }
      ]
    }
  },

    truth: {
    id: "truth",
    label: "진실",
    labelEn: "Truth",
    recommendations: {
      genres: [
        { genreId: "piano_pop", weight: 4, reason: "꾸밈없이 직접 전달되는 정서와 잘 맞음" },
        { genreId: "acoustic_pop", weight: 3, reason: "담백하고 솔직한 분위기를 살리기 좋음" },
        { genreId: "ballad", weight: 3, reason: "고백과 고지의 감정선을 선명하게 전달할 수 있음" },
        { genreId: "cinematic_pop", weight: 1, reason: "무거운 진실 공개나 장면 전환에 적합함" }
      ],
      bpms: [
        { bpmId: "slow_mid_76_90", weight: 4, reason: "차분하게 진실을 드러내는 흐름에 적합함" },
        { bpmId: "mid_91_105", weight: 2, reason: "보다 분명하고 직진적인 전달감에 어울림" },
        { bpmId: "slow_60_75", weight: 1, reason: "무겁고 조심스러운 진실 고백에 적합함" }
      ]
    }
  },

  deception: {
    id: "deception",
    label: "거짓",
    labelEn: "Deception",
    recommendations: {
      genres: [
        { genreId: "trip_hop", weight: 4, reason: "불안하고 음영이 많은 심리를 표현하기 좋음" },
        { genreId: "synthwave", weight: 2, reason: "차갑고 인공적인 느낌을 줄 수 있음" },
        { genreId: "ambient", weight: 2, reason: "숨기고 감추는 공기를 만들기 좋음" },
        { genreId: "techno", weight: 2, reason: "기계적 반복과 긴장감 있는 구조에 적합함" }
      ],
      bpms: [
        { bpmId: "mid_91_105", weight: 3, reason: "심리전과 긴장 유지에 적합한 구간" },
        { bpmId: "slow_mid_76_90", weight: 3, reason: "은밀하고 불안정한 감정선을 담기 좋음" },
        { bpmId: "up_121_135", weight: 1, reason: "추격감이나 급박한 거짓의 붕괴에 어울림" }
      ]
    }
  },

  celebration: {
    id: "celebration",
    label: "축하",
    labelEn: "Celebration",
    recommendations: {
      genres: [
        { genreId: "house", weight: 4, reason: "축제감과 상승 에너지를 강하게 살릴 수 있음" },
        { genreId: "electronic_pop", weight: 4, reason: "반짝이고 화려한 분위기 표현에 적합함" },
        { genreId: "indie_pop", weight: 2, reason: "가볍고 사랑스러운 축하 무드에 잘 맞음" },
        { genreId: "acoustic_pop", weight: 1, reason: "소박하고 따뜻한 축하 분위기에 적합함" }
      ],
      bpms: [
        { bpmId: "up_121_135", weight: 4, reason: "밝고 활기찬 축하 무드에 가장 적합함" },
        { bpmId: "mid_up_106_120", weight: 3, reason: "경쾌하고 대중적인 축하곡 흐름에 좋음" },
        { bpmId: "fast_136_150", weight: 1, reason: "강한 파티/클럽형 축하 분위기에 어울림" }
      ]
    }
  },

  mourning: {
    id: "mourning",
    label: "애도",
    labelEn: "Mourning",
    recommendations: {
      genres: [
        { genreId: "ambient", weight: 4, reason: "깊은 여백과 정적인 슬픔을 표현하기 좋음" },
        { genreId: "ballad", weight: 3, reason: "애도의 감정을 직접적으로 전달하기 좋음" },
        { genreId: "piano_pop", weight: 3, reason: "조용하고 인간적인 슬픔에 적합함" },
        { genreId: "cinematic_pop", weight: 2, reason: "장면감 있는 추모 서사에 잘 어울림" }
      ],
      bpms: [
        { bpmId: "slow_60_75", weight: 4, reason: "애도와 추모의 무게감을 담기 적합함" },
        { bpmId: "slow_mid_76_90", weight: 2, reason: "현대 감성형 애도 곡으로 확장하기 좋음" },
        { bpmId: "free_or_very_slow", weight: 1, reason: "거의 멈춘 듯한 정서 표현에 적합함" }
      ]
    }
  },

  victory: {
    id: "victory",
    label: "승리",
    labelEn: "Victory",
    recommendations: {
      genres: [
        { genreId: "cinematic_pop", weight: 4, reason: "성취와 도달의 서사를 크게 펼치기 좋음" },
        { genreId: "indie_rock", weight: 3, reason: "강한 추진력과 해방감을 담기 좋음" },
        { genreId: "electronic_pop", weight: 2, reason: "현대적이고 선명한 고양감에 적합함" },
        { genreId: "house", weight: 2, reason: "몸이 열리는 승리감과 파티 무드에 어울림" }
      ],
      bpms: [
        { bpmId: "mid_up_106_120", weight: 4, reason: "성취감과 전진감이 균형 있게 살아남" },
        { bpmId: "up_121_135", weight: 3, reason: "더 선명하고 역동적인 승리 무드에 적합함" },
        { bpmId: "fast_136_150", weight: 1, reason: "극적인 클라이맥스형 승리에 어울림" }
      ]
    }
  },

  defeat: {
    id: "defeat",
    label: "패배",
    labelEn: "Defeat",
    recommendations: {
      genres: [
        { genreId: "ballad", weight: 3, reason: "좌절과 상실의 감정을 직접적으로 전달하기 좋음" },
        { genreId: "ambient", weight: 3, reason: "무너짐 이후의 공허를 표현하기 좋음" },
        { genreId: "piano_pop", weight: 2, reason: "담담한 패배감과 독백형 감정에 적합함" },
        { genreId: "trip_hop", weight: 2, reason: "무거운 긴장과 패배 이후의 불안에 어울림" }
      ],
      bpms: [
        { bpmId: "slow_60_75", weight: 3, reason: "패배의 무게와 가라앉는 감정선에 적합함" },
        { bpmId: "slow_mid_76_90", weight: 3, reason: "현대 감성 곡의 패배/좌절 서사에 무난함" },
        { bpmId: "mid_91_105", weight: 1, reason: "패배 후 다시 걷는 흐름의 정서에 어울림" }
      ]
    }
  },


  challenge: {
    id: "challenge",
    label: "도전",
    labelEn: "Challenge",
    recommendations: {
      genres: [
        { genreId: "indie_rock", weight: 4, reason: "직선적 전진감과 에너지를 살리기 좋음" },
        { genreId: "cinematic_pop", weight: 3, reason: "성과를 향해 커지는 서사를 만들기 좋음" },
        { genreId: "electronic_pop", weight: 2, reason: "현대적인 자신감과 속도감을 담기 적합함" },
        { genreId: "house", weight: 2, reason: "고양감과 추진력을 반복적으로 밀어주기 좋음" }
      ],
      bpms: [
        { bpmId: "mid_up_106_120", weight: 4, reason: "도전의 추진력과 균형감이 좋음" },
        { bpmId: "up_121_135", weight: 3, reason: "더 강한 질주감과 몰입감에 적합함" },
        { bpmId: "fast_136_150", weight: 1, reason: "극한의 고조감을 줄 때 사용할 수 있음" }
      ]
    }
  },

  giving_up: {
    id: "giving_up",
    label: "포기",
    labelEn: "Giving Up",
    recommendations: {
      genres: [
        { genreId: "ambient", weight: 4, reason: "힘이 빠진 공기와 체념의 정적을 표현하기 좋음" },
        { genreId: "ballad", weight: 3, reason: "감정적 체념과 독백 전달에 적합함" },
        { genreId: "piano_pop", weight: 2, reason: "말하듯 무너지는 정서를 담기 좋음" },
        { genreId: "trip_hop", weight: 1, reason: "무거운 심리적 낙하감을 표현할 수 있음" }
      ],
      bpms: [
        { bpmId: "slow_60_75", weight: 4, reason: "체념과 힘 빠짐의 정서에 가장 잘 맞음" },
        { bpmId: "slow_mid_76_90", weight: 2, reason: "현대 감성곡 형태로 확장하기 무난함" },
        { bpmId: "free_or_very_slow", weight: 1, reason: "거의 멈춘 듯한 감정 표현에 적합함" }
      ]
    }
  }
};
