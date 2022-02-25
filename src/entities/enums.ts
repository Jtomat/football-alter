
enum GROUP {
    A ='A',
    B ='B',
    C ='C',
    D ='D',
    E ='E',
    F ='F',
}
enum POSITION {
    GOALKEEPER='Goalkeeper',
    DEFENDER='Defender',
    MIDFIELD = 'Midfield',
    FORWARD = 'Forward',
}
enum EVENT {
    GOAL = 'Goal',
    FOUL = 'Foul',
    FREE_KICK = 'Free kick',
    CORNER = 'Corner',
    PENALTY = 'Penalty',
    SUBSTITUTE ='Substitute',
    YELLOW_CARD = 'Yellow card',
    RED_CARD = 'Red card',
}
enum STAGE {
    GROUP_STAGE = 'Group stage',
    ROUND_OF_16 = 'Round of 16',
    QUARTER_FINAL ='Quarter final',
    SEMI_FINAL = 'Semi-Final',
    FINAL = 'Final',
}

enum REGION {
    AFRICA ='Africa',
    AMERICA = 'America',
    ASIA = 'Asia',
    EUROPE = 'Europe',
    OTHERS = 'Others',
}

export {STAGE, EVENT, GROUP, POSITION, REGION}
