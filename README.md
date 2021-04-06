### 1. 어플 소개
**냥비요정🐱**
#### 자신의 소비 현황, 특히 '낭비'라고 생각되는 소비 부문의 금액을 확인하고 관리할 수 있는 어플입니다. </br>
#### 각 개인마다 다른 낭비 항목들을 제시하고 오늘, 매 주, 매 월 등 어떤 항목에 얼만큼의 낭비를 했는지 보여줌으로써 절약을 유도합니다.🐱

---------------------------------

### Directory
```
├── config
│   ├── express.js           # express 설정값
│   ├── jwtMiddleware.js     # jwt middleware명
│   ├── nodeMailer.js        # 메일 발송 모듈
│   ├── resMoudule.js        # response module
│   ├── winston.js           # logger 생성 
├── pulbic                   # 이미지 파일  
├── src                          
│   ├── app                  # app
│   ├───├──controllers       # 로직 처리 
│   ├───├───|───itemController.js # 항목 추가, 삭제, 수정 처리 
│   ├───├───|───userController.js # 사용자 가입, 로그인 
│   ├───├───|───testController.js # 테스트 
│   ├───├──routes            # 라우트 
│   ├───├───|───itemRoute.js      # 아이템 
│   ├───├───|───userRoute.js      # 사용자 
│   ├───├───|───testRoute.js      # 테스트 
├── .gitignore                     
├── package-lock.json                  
├── package.json            	 
├── index.js                     
└── README.md
