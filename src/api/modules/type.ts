// * 请求响应参数(不包含data)
export interface Result {
  code: string;
  msg: string;
}
// * 请求响应参数(包含data)
export interface ResultData<T = any> extends Result {
  data?: T;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Login {
  // 命名空间命名
  export interface ReqLoginForm {
    username: string;
    password: string;
    captcha: string;
  }
  export interface ResLogin {
    id: string;
    token: string;
  }
  export interface ResAuthButtons {
    [propName: string]: any;
  }
}
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OtherLabel {
  // 其他标签类型
  export interface AddWealType {
    name: string;
    parentId: number | string | undefined;
  }

  export interface UpdateWealStatusType {
    id: number | string | undefined;
    status: number;
  }

  export interface UpdateWealType {
    name: string;
    id: number | string | undefined;
  }
}
