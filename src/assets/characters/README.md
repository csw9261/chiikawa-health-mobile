# 캐릭터 이미지 넣는 곳

여기에 캐릭터 이미지를 넣으면 앱에 자동으로 연결됨. 이미지가 없으면 이모지로 대신 표시되므로, 이미지 없이도 앱은 정상 동작함.

## 폴더 구조

이미지 1장 = 도감 1칸. 칸(=캐릭터)마다 폴더를 하나씩 만들고, 그 안에 `idle.png` 한 장만 넣음.

```
src/assets/characters/
  chiikawa/
    idle.png
  hachiware/
    idle.png
  ...
```

## 규칙

- 폴더명은 id와 똑같이 맞춰야 함. id 목록과 해금 조건은 `src/data/characters.ts` 참고 (배열 순서 = 도감 순서).
- 파일명은 `idle` 로 고정 (이미지 1장만 사용).
- 지원 확장자: `png`, `webp`, `svg`, `jpg`, `jpeg`
- 이미지가 없으면 이모지로 폴백되므로, 이미지 없이도 앱은 정상 동작함.
- 정사각형(권장 360x360) 투명 배경 PNG를 권장.

## 도감 2종 (에셋 중복 없음)

- **운동 도감**(`workout`): 누적 운동 횟수로 해금. 폴더 id = 위의 `chiikawa`, `hachiware`, ... 및 확장분 `wo-14` ~ `wo-50`.
- **걸음 도감**(`steps`): 누적 걸음으로 해금. 폴더 id = `step-01` ~ `step-50`.
  - 예: `src/assets/characters/step-01/idle.png`
  - 걸음 도감 이미지는 운동 도감과 **겹치지 않는 새 이미지**여야 함.

id/해금 조건은 `src/data/characters.ts` 참고.

## 칸(캐릭터) 추가하기

1. `src/data/characters.ts`에서 해당 도감 배열에 항목 추가.
2. 같은 id로 폴더를 만들고 `idle.png` 한 장을 넣음.

코드를 더 고칠 필요 없음.
