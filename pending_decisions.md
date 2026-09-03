# Pending decisions (사용자 응답 대기)

> 각 줄에 지시를 적어두면 다음 실행이 STEP 1에서 읽어 반영합니다.
> 처리 완료된 줄은 삭제하거나 `[x]`로 바꾸세요.

## 2026-07-16
- [x] 🆕 신규 업체: Coco Robotics (Coco Robotics Brings Autonomous Delivery to Washington, D.C.) — ❌ 2026-09-03 보류 종료: 자동화 하드웨어 일일 상한 1건이라 타겟 추가해도 최종 저장량은 그대로고 검색 예산만 소모
- [x] 🚫 차단 도메인 후보: yournews.com — 추가하려면 `BLOCK` 표시  ✅ 2026-09-02 prompt.md Blocked Domains에 반영

## 2026-07-20
- [x] 🔒 접근불가: [Instacart] Instacart, Arpalus 인수—실시간 선반 인텔리전스 (Cloudflare 차단) → https://investors.instacart.com/news-releases/news-release-details/instacart-acquires-arpalus-advance-real-time-shelf-intelligence (✅ 2026-07-21 PR Newswire 대체 소스로 수집 완료, id 76c73f8c)
      (재시도 원하면 이 줄 끝에 `RETRY: chrome` 추가)
- [x] 🔒 접근불가: [Instacart] Instacart–Tractor Supply 파트너십—반려·농자재 배달 (Cloudflare 차단) → https://investors.instacart.com/news-releases/news-release-details/instacart-and-tractor-supply-partner-deliver-pet-supplies-farm (✅ 2026-07-28 company.instacart.com 공식 뉴스룸 대체 소스로 수집 완료)
      (재시도 원하면 이 줄 끝에 `RETRY: chrome` 추가)

## 2026-07-23
- [x] 🆕 신규 업체: Matternet (Matternet taps Beeline to accelerate US drone delivery expansion) — ❌ 2026-09-03 보류 종료: 동일 — 드론 하드웨어 업체, 자동화 하드웨어 버킷 상한에 묶임

## 2026-07-27
- [x] 🆕 신규 업체: Deliverect (Deliverect-SoundHound AI 음성주문 자동화 제휴) — ❌ 2026-09-03 보류 종료: 주문관리 SaaS 벤더로 food delivery·quick-commerce 사업자가 아님. Unknown company rule로 건별 수집은 계속 가능
- [x] 🆕 신규 업체: Talabat (Talabat owner Delivery Hero acquired by Uber) — ❌ 2026-09-03 보류 종료: dedup-judge 그룹 매핑에 Delivery Hero 하위 브랜드로 이미 등록됨. 타겟 추가 시 Uber-DH 딜 파생 기사만 늘어남
- [x] 🆕 신규 업체: Glovo (Uber to Take Over Glovo Morocco in Delivery Hero Deal) — ❌ 2026-09-03 보류 종료: 동일 — Delivery Hero 그룹 매핑에 이미 포함

## 2026-07-28
- [x] 🆕 신규 업체: NTT동일본 (도쿄 미드타운 야에스 로봇 배송 본격 가동 (NAVER Cloud·미쓰이부동산 협력)) — ❌ 2026-09-03 보류 종료: 동일 — 로봇 배송 실증 파트너이지 배달 플랫폼이 아님
- [x] 🆕 신규 업체: RIVR (RIVR, 험지·악천후 배달로봇 시험 확대 (아마존 투자)) — ❌ 2026-09-03 보류 종료: 동일 — 로봇 하드웨어 업체, 자동화 하드웨어 버킷 상한에 묶임

## 2026-07-29
- [x] 🆕 신규 업체: Atoms (Travis Kalanick's robotics company raises $1.7B, led by a16z) — ❌ 2026-09-03 보류 종료: 동일 + 최초 포착 기사가 투자유치 앵글이라 Exclude 규칙에 걸림

## 2026-07-30
- [x] 🆕 신규 업체: Hy-Vee (Hy-Vee introduces rapid online ordering options — 30분 픽업·배송) — ❌ 2026-09-03 보류 종료: 동일 — 미국 리테일러, 배달 플랫폼 아님

## 2026-08-03
- [x] 🆕 신규 업체: Kroger (Kroger releases AI Shopping Assistant storewide — 미국 그로서리 AI 쇼핑 어시스턴트 전사 확대) — ❌ 2026-09-03 보류 종료: 미국 리테일러로 배달 플랫폼이 아님. 입점 규칙 화이트리스트 논의 대상이지 타겟 회사 대상은 아님

## 2026-08-10
- [x] 🆕 신규 업체: Manna (Manna CEO Explains Why Drone Firm Chose Tulsa for U.S. Hub — 아일랜드 드론배달 기업, 미국 털사 거점) — ❌ 2026-09-03 보류 종료: 동일 — 드론 하드웨어 업체, 자동화 하드웨어 버킷 상한에 묶임

## 2026-08-12
- [x] 🆕 신규 업체: Google (Google Maps adds agentic features, including food ordering and hotel bookings) — ❌ 2026-09-03 보류 종료: 타겟 추가 시 배달과 무관한 Google 일반 뉴스가 KR·GL 배치 검색에 대량 유입됨. 입점 화이트리스트에 이미 있고 Unknown company rule로 Maps 주문 관련 건은 계속 잡힘

## 2026-08-13
- [x] 🆕 신규 업체: 부릉(메쉬코리아) (라이더 최적동선 짜주니 상점도착 3.5분 단축…부릉 'AI의 힘') — `ADD`  ✅ 2026-09-03 KR 타겟에 추가(배치 KR-B). 국내 배달대행 3자물류 — 배차·동선 최적화가 배민 배달 실행 레이어와 직접 비교 가능

## 2026-08-31
- [x] 🚫 차단 도메인 후보: ad-hoc-news.de — 추가하려면 `BLOCK` 표시  ✅ 2026-09-02 prompt.md Blocked Domains에 반영

## 2026-09-02
- [x] 🚫 차단 도메인 후보: statista.com — 추가하려면 `BLOCK` 표시 (산업 배치 검색이 뉴스 대신 상시형 마켓리포트로 채워짐)  ✅ 2026-09-02 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: grandviewresearch.com — 추가하려면 `BLOCK` 표시 (산업 배치 검색이 뉴스 대신 상시형 마켓리포트로 채워짐)  ✅ 2026-09-02 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: fortunebusinessinsights.com — 추가하려면 `BLOCK` 표시 (산업 배치 검색이 뉴스 대신 상시형 마켓리포트로 채워짐)  ✅ 2026-09-02 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: mordorintelligence.com — 추가하려면 `BLOCK` 표시 (산업 배치 검색이 뉴스 대신 상시형 마켓리포트로 채워짐)  ✅ 2026-09-02 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: imarcgroup.com — 추가하려면 `BLOCK` 표시 (산업 배치 검색이 뉴스 대신 상시형 마켓리포트로 채워짐)  ✅ 2026-09-02 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: researchandmarkets.com — 추가하려면 `BLOCK` 표시 (산업 배치 검색이 뉴스 대신 상시형 마켓리포트로 채워짐)  ✅ 2026-09-02 prompt.md Blocked Domains에 반영

## 2026-09-03
- [x] 🚫 차단 도메인 후보: thebusinessresearchcompany.com — `BLOCK`  ✅ 2026-09-03 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: futuremarketinsights.com — `BLOCK`  ✅ 2026-09-03 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: businessresearchinsights.com — `BLOCK`  ✅ 2026-09-03 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: persistencemarketresearch.com — `BLOCK`  ✅ 2026-09-03 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: marketdataforecast.com — `BLOCK`  ✅ 2026-09-03 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: insightaceanalytic.com — `BLOCK`  ✅ 2026-09-03 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: giiresearch.com — `BLOCK`  ✅ 2026-09-03 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: coherentmarketinsights.com — `BLOCK`  ✅ 2026-09-03 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: marketresearchfuture.com — `BLOCK`  ✅ 2026-09-03 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: 360iresearch.com — `BLOCK`  ✅ 2026-09-03 prompt.md Blocked Domains에 반영
- [x] 🚫 차단 도메인 후보: marketreportsworld.com — `BLOCK`  ✅ 2026-09-03 prompt.md Blocked Domains에 반영
