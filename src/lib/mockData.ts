export type Restaurant = {
    id: string;
    name: string;
    discountRate: number;
    remainingCoupons: number;
    image: string;
    description: string;
    address: string;
    openTime: string;
};

export type MenuItem = {
    id: string;
    restaurantId: string;
    name: string;
    originalPrice: number;
    discountedPrice: number;
    image: string;
    description: string;
};

export const MOCK_RESTAURANTS: Restaurant[] = [
    {
        id: "r1",
        name: "바삭 수제버거 존 역삼점",
        discountRate: 15,
        remainingCoupons: 12,
        image: "🍔",
        description: "육즙 가득한 최고의 스매시 버거.",
        address: "서울시 강남구 테헤란로 123 1층",
        openTime: "매일 11:00 ~ 21:00 (라스트 오더 20:30)"
    },
    {
        id: "r2",
        name: "서울 매운짬뽕 본점",
        discountRate: 20,
        remainingCoupons: 5,
        image: "🍜",
        description: "스트레스가 확 풀리는 진짜 매운맛.",
        address: "서울시 강남구 역삼로 456 2층",
        openTime: "화-일 11:30 ~ 22:00 (월 휴무)"
    },
    {
        id: "r3",
        name: "그린 보울 샐러드",
        discountRate: 10,
        remainingCoupons: 34,
        image: "🥗",
        description: "가볍고 건강한 유기농 샐러드.",
        address: "서울시 강남구 논현로 789 1층",
        openTime: "매일 08:00 ~ 20:00"
    },
];

export const MOCK_MENUS: MenuItem[] = [
    // ----------- Burger Joint (10+ Items) -----------
    {
        id: "m_b1",
        restaurantId: "r1",
        name: "클래식 스매시 버거",
        originalPrice: 10000,
        discountedPrice: 8500,
        image: "🍔",
        description: "100% 소고기 패티 페이퍼처럼 얇게 누른 대표 메뉴"
    },
    {
        id: "m_b2",
        restaurantId: "r1",
        name: "더블 치즈 스매시 버거",
        originalPrice: 14000,
        discountedPrice: 11900,
        image: "🍔",
        description: "소고기 패티 2장, 체다 치즈 2장의 진한 풍미"
    },
    {
        id: "m_b3",
        restaurantId: "r1",
        name: "할라피뇨 바베큐 버거",
        originalPrice: 12000,
        discountedPrice: 10200,
        image: "🌶️",
        description: "매콤한 방울 할라피뇨와 특제 바베큐 소스"
    },
    {
        id: "m_b4",
        restaurantId: "r1",
        name: "머쉬룸 스위스 치즈 버거",
        originalPrice: 13500,
        discountedPrice: 11400,
        image: "🍄",
        description: "구운 양송이 트러플 오일, 부드러운 스위스 치즈"
    },
    {
        id: "m_b5",
        restaurantId: "r1",
        name: "베이컨 토마토 오리지널",
        originalPrice: 11500,
        discountedPrice: 9700,
        image: "🥓",
        description: "크리스피 베이컨과 신선한 토마토의 정석 조합"
    },
    {
        id: "m_b6",
        restaurantId: "r1",
        name: "바삭 감자튀김 (M)",
        originalPrice: 4000,
        discountedPrice: 3400,
        image: "🍟",
        description: "케이준 스파이스로 맛을 낸 두툼한 감자튀김"
    },
    {
        id: "m_b7",
        restaurantId: "r1",
        name: "치즈폭포 감자튀김",
        originalPrice: 6500,
        discountedPrice: 5500,
        image: "🧀",
        description: "녹진한 체다치즈 소스가 듬뿍 올라간 감자튀김"
    },
    {
        id: "m_b8",
        restaurantId: "r1",
        name: "크리스피 어니언 링",
        originalPrice: 5500,
        discountedPrice: 4600,
        image: "🧅",
        description: "맥주반죽으로 튀겨 극강의 바삭함을 자랑하는 양파링"
    },
    {
        id: "m_b9",
        restaurantId: "r1",
        name: "수제 바닐라 밀크쉐이크",
        originalPrice: 6000,
        discountedPrice: 5100,
        image: "🥛",
        description: "버거와 찰떡궁합인 꾸덕한 진짜 바닐라 쉐이크"
    },
    {
        id: "m_b10",
        restaurantId: "r1",
        name: "코카콜라 / 제로콜라",
        originalPrice: 3000,
        discountedPrice: 2500,
        image: "🥤",
        description: "얼음 컵이 함께 제공되는 탄산음료"
    },
    {
        id: "m_b11",
        restaurantId: "r1",
        name: "버그 맥주 (생맥주 500cc)",
        originalPrice: 5000,
        discountedPrice: 4200,
        image: "🍺",
        description: "퇴근 후 햄맥을 완성해주는 시원한 생맥주"
    },

    // ----------- Noodle -----------
    {
        id: "m3",
        restaurantId: "r2",
        name: "얼큰 소고기 짬뽕",
        originalPrice: 12000,
        discountedPrice: 9600,
        image: "🍜",
        description: "불맛 입힌 차돌박이가 듬뿍"
    },
    {
        id: "m4",
        restaurantId: "r2",
        name: "고기 군만두 (6조각)",
        originalPrice: 6000,
        discountedPrice: 4800,
        image: "🥟",
        description: "짬뽕 매운맛을 잡아주는 중국식 고기 군만두"
    },

    // ----------- Salad -----------
    {
        id: "m5",
        restaurantId: "r3",
        name: "아보카도 치킨 샐러드 볼",
        originalPrice: 13000,
        discountedPrice: 11700,
        image: "🥗",
        description: "단백질과 건강한 지방이 완벽하게 조화된 식단"
    },
];
