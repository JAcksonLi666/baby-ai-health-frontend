interface ReasonMap {
  hungry: string;
  sleepy: string;
  diaper: string;
  discomfort: string;
  pain: string;
  lonely: string;
  overstimulated: string;
  unknown: string;
}

interface ReasonTagColor {
  hungry: string;
  sleepy: string;
  diaper: string;
  discomfort: string;
  pain: string;
  lonely: string;
  overstimulated: string;
  unknown: string;
}

export const REASON_MAP: ReasonMap = {
  hungry: '饿了',
  sleepy: '困了',
  diaper: '尿布湿了',
  discomfort: '不舒服',
  pain: '疼痛',
  lonely: '需要安抚',
  overstimulated: '过度刺激',
  unknown: '未知',
};

export const REASON_TAG_COLOR: ReasonTagColor = {
  hungry: 'red',
  sleepy: 'purple',
  diaper: 'orange',
  discomfort: 'volcano',
  pain: 'magenta',
  lonely: 'blue',
  overstimulated: 'cyan',
  unknown: 'default',
};
