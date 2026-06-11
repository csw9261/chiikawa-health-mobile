# 먼작귀 헬스 (chiikawa-health-mobile)

치이카와(먼작귀) 캐릭터로 운동 동기를 부여하는 **개인용 안드로이드 헬스 앱**임.
걷기·운동을 기록하면 캐릭터를 모으고, 업적·레벨·포인트·미션으로 꾸준함을 보상함.

> 개인 사용 목적이며 배포/상용 목적이 아님. 캐릭터·배경 이미지는 저장소에 포함하지 않음(아래 "에셋" 참고).

---

## 주요 기능

- **홈**: 오늘 걸음·목표 달성률, 캐릭터 반응, 격려 메시지
- **운동 기록**: 리스트/달력 서브탭, 연도별 보기, 직접 기록 추가(달력 날짜 선택 포함)
- **도감 2분할**: 운동횟수 도감 / 걸음수 도감(각 50칸), 누적 달성으로 캐릭터 해금
- **성취**: 업적 86개(10개 카테고리), 레벨·경험치 안내, 걸음/운동 연속일, 걸음 히트맵·주간 차트
- **포인트 제도**: 걸음·운동·업적·미션으로 적립, 환전 차감(비밀번호 보호·설정에서 변경 가능)
- **미션**: 일일/주간/월간 미션, 자동 회전 + 직접 선택(바꾸기), 시간대 미션, 보상 자동 적립
- **공유**: 텍스트 요약을 공유시트(카톡·메시지 등)로 공유
- **알림**: 로컬 알림(운동 독려 등)

데이터는 **전부 기기 로컬에 저장**됨(IndexedDB / Dexie). 별도 서버·백엔드 없음.

---

## 기술 스택

- **앱 셸**: Capacitor 8 (웹 → 네이티브 안드로이드)
- **프론트엔드**: React 19, TypeScript 5, Vite, Tailwind CSS 3, Framer Motion
- **데이터**: Dexie(IndexedDB), Recharts, canvas-confetti
- **헬스 연동**: `@capgo/capacitor-health` (Health Connect — 걸음 중심)
- **네이티브 플러그인**: `@capacitor/preferences`, `@capacitor/local-notifications`, `@capacitor/share`

> Health Connect/삼성헬스가 안정적으로 제공하는 값이 걸음 위주라, 앱 핵심 지표를 **걸음 중심**으로 설계함.

---

## 개발 / 빌드

### 사전 준비
- Node.js (LTS), npm
- Android Studio (안드로이드 빌드용), Android SDK (minSdk 26)

### 의존성 설치
```bash
npm install
```

### 웹 개발 서버 (브라우저에서 UI 확인, 목 데이터 사용)
```bash
npm run dev
```

### 프로덕션 빌드 + 안드로이드 동기화
```bash
npm run build
npx cap sync android
```

### 디버그 APK 빌드
```bash
cd android
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
ANDROID_HOME="$HOME/Library/Android/sdk" \
./gradlew assembleDebug
# 결과: android/app/build/outputs/apk/debug/app-debug.apk
```
또는 Android Studio로 `android/` 폴더를 열어 빌드·실행함.

---

## 에셋 (저장소에 미포함)

캐릭터·배경 이미지와 앱 아이콘은 **개인 소장 이미지라 git에서 제외**함(`.gitignore`).
클론 후 본인이 직접 넣어야 이미지가 표시됨(없으면 이모지/기본값으로 폴백).

| 종류 | 위치 | 규격 |
|------|------|------|
| 캐릭터 | `src/assets/characters/<id>/idle.png` | 360×360, 투명 배경 PNG |
| 배경 | `src/assets/backgrounds/bg-NN.webp` | 화면 배경용 webp |
| 앱 아이콘 | `assets/icon-*.png` → `@capacitor/assets`로 생성 | 1024×1024 권장 |

- 캐릭터 id 목록·해금 조건: `src/data/characters.ts`
- 앱 아이콘 생성: 소스 이미지를 `assets/`에 둔 뒤
  ```bash
  npx capacitor-assets generate --android --iconBackgroundColor '#ffc2c2'
  ```

---

## 프로젝트 구조 (요약)

```
src/
  components/   재사용 UI (카드·달력·축하창·공유 버튼 등)
  screens/      탭 화면 (홈·운동·미션·도감·성취·설정)
  game/         게임 로직 (업적·미션 엔진, 진행도 타입) — 순수 함수, 단위 테스트
  data/         정적 정의 (업적·미션·캐릭터)
  db/           Dexie 스토어 (스냅샷·포인트·미션 등)
  hooks/        데이터 훅 (진행도·포인트·미션·운동)
  services/     헬스 데이터 소스 추상화 + 구현(Capacitor/목)·알림·공유
  config/       상수 (헬스·게이미피케이션·미션 설정)
android/        Capacitor 안드로이드 네이티브 프로젝트
```

---

## 테스트

```bash
npx vitest run
```
핵심 게임 로직(연속일·레벨·누적 진행도)에 단위 테스트가 있음.
