# 总结套路&技巧

### 栈

[每日温度](https://leetcode-cn.com/problems/daily-temperatures/)，维护一个单调栈来处理，不符合单调结果的元素暂时入栈，每次出现符合条件的元素，就从栈顶递归的判断已经入栈的所有元素是否满足条件
