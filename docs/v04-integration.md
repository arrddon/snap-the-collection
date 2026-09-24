# v04 최종 통합 적용 — Lens Studio에서 마지막에 한 번만 진행

2026-09-24 합의: 단계마다 Lens Studio를 수정하거나 기기 테스트하지 않는다.
코드·서버·SQL·적용 항목을 먼저 준비하고, 3단계 이후 아래 체크리스트로 한 번에 적용한다.
PHASE1_CAPTURE.md는 구현 기록이며, 그 문서의 기기 확인도 마지막으로 미룬다.

## 현재 작업 범위

- 1단계 코드 완료: 자동 닫힘, 교차선 거부, 오목한 윤곽, 투명 PNG,
  실제 RGB 카메라 투영 보정, PNG 저장. 실기 검증은 대기.
- 2단계 코드 완료: 시작 시 사각 가이드와 `Show your mission`, 기존 확인 버튼을
  `Start`로 재사용, OCR 성공 후 드로잉 허용, 카테고리 저장·웹 표시.
- 3단계 예정: 업로드 후 공간 배치·이동, 선택 하이라이트와 `+`, 전체 컬렉션에서
  중복 없는 랜덤 fragment 추가, 표시 개수 제한, 컬렉션에서만 손바닥 Capture 버튼.
- Capture 재진입 및 Redraw는 이전 미션을 지우고 카드 읽기부터 다시 시작한다.
- 미션은 원문을 카테고리로 사용한다. AI 결과 제목/6개 키워드와 별개다.
- 긴 원문은 500자까지 저장하며, Lens 상태 라벨은 90자를 넘으면 말줄임 표시한다.
- OCR 실패·빈 텍스트·너무 긴 텍스트는 Start 재시도. 카드 사진은 Supabase에 저장하지 않는다.

## 작업 경로

- Lens: `D:\VEGCOMPA\ARRDDON\PROJECTS\20260303_Spectacles_TheCollection\SnapStudio_TheCollection_v04`
- 현재 WebApp: `D:\VEGCOMPA\ARRDDON\PROJECTS\20260303_Spectacles_TheCollection\WebApp\the-collection-v04`
- 이전 `WebApp\the-collection`은 2단계부터 수정하지 않는다.
- GitHub: https://github.com/arrddon/snap-the-collection
- 이 저장소에는 WebApp 변경과 통합 문서를 반영한다. Lens 프로젝트와 비밀키는 포함하지 않는다.

## 마지막에 한 번만 적용할 순서

1. **Supabase**: WebApp의 `supabase/migrations/202609240001_mission_text.sql`을
   해당 프로젝트 SQL Editor에서 실행한다. 기존 `collection_items`에 nullable
   `mission_text`만 추가한다. 기존 행·버킷·정책은 삭제하지 않는다.
   SQL 파일을 GitHub에 올리는 것만으로 DB에 적용되지는 않는다.
2. **웹 배포**: GitHub에 연결된 Vercel 배포가 성공했는지 확인한다.
   기존 Supabase URL·키·버킷 환경 변수는 유지한다. 새로운 환경 변수는 필요 없다.
   Storage 버킷에 MIME 제한이 있다면 `image/png` 허용 여부를 확인한다.
3. **Lens Studio 재오픈**: 디스크에 수정된 v04 프로젝트와 Scene 3를 읽는다.
   열려 있던 에디터의 이전 씬을 디스크 위에 덮어쓰지 않도록 변경 동기화를 확인한다.
4. **스크립트 import**: `FragmentPolygon.ts`, `FragmentPngCapture.ts`,
   `MissionCardUI.ts`는 기존 스크립트가 import하는 보조 모듈이다.
   씬에 별도 Script Component로 붙이지 않는다.
5. **기존 연결 확인**: ConnectionEngine의 Capture Source → OutlineMeshCapture,
   Presenter → PromptPresenter. Outline의 Camera → Camera Object,
   Line Mesh/Fill Mesh → 기존 두 Mesh Visual, Capture Texture → MaskedCaptureRT,
   Confirm Button → ConfirmButton_v2, Cancel Button → CancelButton_v2,
   Drawing State Listener → PromptPresenter. 현재 파일의 기존 연결을 재사용한다.
6. **렌더 타깃**: MaskedCaptureRT는 768×768. 사각 미션 프레임과 캡처용 카메라는
   코드에서 생성하므로 삭제된 예전 Empty/Masked 카메라를 새로 만들 필요가 없다.
7. **버튼**: 기존 ConfirmButton의 `captureAndConfirm` 연결을 유지한다.
   미션 화면에서는 Start/OCR, 드로잉 완료 후에는 PNG 수집으로 동작한다.
8. **시작 모드**: ModeToggle은 OnStart에 Capture로 진입한다. Inspector의
   Start In Capture Mode도 true로 맞춰 표시 상태를 일치시킨다.
9. **기존 API 설정**: ConnectionEngine의 OpenAI 키와 모델 설정을 유지한다.
   Upload Endpoint는 배포된 `/api/upload` 주소여야 한다. OCR도 기존 AI 연결을 사용한다.
10. **3단계 씬 항목**: 다음 작업 후 이 문서에 추가한다. 그때까지 실기 적용 보류.

## 통합 실기 확인

- 실행 → 사각형, Show your mission, Start만 나타나고 드로잉이 차단되는지.
- 카드를 맞추고 Start → 읽은 원문 카테고리 → 드로잉으로 전환되는지.
- 빈 카드/가독성 없는 카드 → 재시도, Start 연타 → 중복 처리 없음.
- U자/오목한 별을 한 붓으로 그리면 닫히고, 교차선은 재그리기를 안내하는지.
- 결과 PNG의 외부 투명도, 상하 방향, 윤곽 비율 및 프레임 일치.
- 업로드 파일은 PNG이고 `mission_text`와 기존 제목/키워드가 함께 저장되는지.
- Capture 재진입 → 이전 미션이 남지 않고 처음부터 시작하는지.
- 3단계 이후 공간 배치/랜덤 탐색/손바닥 UI 검증을 추가한다.

## 검증 결과와 한계

- 도형 테스트와 업로드 API mock 테스트 통과: 오목/볼록, 양쪽 그리기 방향,
  교차 거부, 192점 제한, PNG/JPEG 바이트·MIME 보존, 미션 문자열 검증.
- 미션 흐름 mock 테스트 통과: 시작, 중복 Start, 초기화, 늦은 OCR 무시,
  빈/과도한 길이/거부 응답, 한글 카테고리, PNG 업로드 메타데이터.
- Lens 변경 파일 타입 검사 통과. 실제 OCR·Supabase 쓰기·기기 GPU 렌더는 미실행.
- WebApp TypeScript·수정 파일 ESLint·Next.js 프로덕션 빌드 통과.
- 드로잉 평면은 약 65cm 기준이다. 대상 깊이가 다르거나 머리를 빠르게 움직이면
  눈/RGB 카메라 시차 및 프레임 시간차가 남을 수 있어 실기 보정 여부를 판단해야 한다.
- 최대 192점, 768px 출력, 카메라 스트림/렌더 타깃 재사용, 미리보기 UV 갱신 최대 10Hz.

참고 API: [OpenAI 이미지 입력](https://developers.openai.com/api/docs/guides/images-vision),
[구조화 응답](https://developers.openai.com/api/docs/guides/structured-outputs).
