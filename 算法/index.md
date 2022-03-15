# 总结套路&技巧

### 栈

- [每日温度](https://leetcode-cn.com/problems/daily-temperatures/)
  维护一个单调栈来处理，不符合单调结果的元素暂时入栈，每次出现符合条件的元素，就从栈顶递归的判断已经入栈的所有元素是否满足条件

- [包含 min 函数的栈](https://leetcode-cn.com/problems/bao-han-minhan-shu-de-zhan-lcof/)
  题目要求 push，pop，min 的时间复杂度都是 O(1)，实际上可以通过维护一个辅助的单调递降的栈，来保持我们始终持有最小值的引用

- [用两个栈模拟队列行为](https://leetcode-cn.com/problems/yong-liang-ge-zhan-shi-xian-dui-lie-lcof/)
  出队列时，检查 out 栈，有则出，否则清空 in 栈 到 out 栈，再从 out 栈 出栈

-

### 双指针

- [找到重复数组](https://leetcode-cn.com/problems/shu-zu-zhong-zhong-fu-de-shu-zi-lcof/)
  这道题有个前置条件，长度为 n，出现的范围是 [0, n-1]，用双指针遍历找到下标和值对应的位置即可，属于一种反向思维

- [替换空格](https://leetcode-cn.com/problems/ti-huan-kong-ge-lcof/)
  比较普通的一道双指针

-

### 链表

- [反转链表](https://leetcode-cn.com/problems/fan-zhuan-lian-biao-lcof/)
  三指针，或者 头插法

- [链表中倒数第 k 个节点](https://leetcode-cn.com/problems/lian-biao-zhong-dao-shu-di-kge-jie-dian-lcof/)
  快慢指针，先用 k 构建出快慢指针的距离差，然后开始遍历链表，快指针遍历结束是，慢指针就是结果

### 二分法

- [旋转数组的最小数字](https://leetcode-cn.com/problems/xuan-zhuan-shu-zu-de-zui-xiao-shu-zi-lcof/)
  一般二分法用在单调数组中，如果不能保证单调性则有可能无法判断下一步的收缩范围，但是旋转数组的两个子数组是各自单调的，所以可以继续使用二分收缩的方法

- [0 ～ n-1 中缺失的数字](https://leetcode-cn.com/problems/que-shi-de-shu-zi-lcof/)
  题目给的数组是递增的，可以用二分查找确定区间

### 递，回溯，剪枝，DFS

- [字符串全排列](https://leetcode-cn.com/problems/zi-fu-chuan-de-pai-lie-lcof/)
  一般如果有全排列关键字，就是回溯/DFS

- [把数字翻译成字符串](https://leetcode-cn.com/problems/ba-shu-zi-fan-yi-cheng-zi-fu-chuan-lcof/)
  一个典型的 DFS，这里只要求组合数，不要具体组合细节，所以不需要回溯变量，也可以用 dp 做

- [打印从 1 到最大的 n 位数](https://leetcode-cn.com/problems/da-yin-cong-1dao-zui-da-de-nwei-shu-lcof/)
  难点是先导 0 的处理，是一个典型的 DFS

- [机器人的运动范围](https://leetcode-cn.com/problems/ji-qi-ren-de-yun-dong-fan-wei-lcof/)
  回溯

### 二叉树

- [判断子结构](https://leetcode-cn.com/problems/shu-de-zi-jie-gou-lcof/)
  递归的思想，想清楚两个子树相等的条件是什么

### 动态规划

- [约瑟夫环](https://leetcode-cn.com/problems/yuan-quan-zhong-zui-hou-sheng-xia-de-shu-zi-lcof/)
  背一下递推公式

- [连续子数组的最大和](https://leetcode-cn.com/problems/lian-xu-zi-shu-zu-de-zui-da-he-lcof/)
  由于序无后效性的影响，这一类的 dp 的递推关系往往会被前后多个因素影响，这里可以通过定义 以 xxx 结尾 这一类的状态方程，斩断这种联系

- [最长不含重复字符的子字符串](https://leetcode-cn.com/problems/zui-chang-bu-han-zhong-fu-zi-fu-de-zi-zi-fu-chuan-lcof/)
  还是以 xxx 结尾来实现无后效性，和上面的一样

### 单调性问题

- [二维数组中的查找](https://leetcode-cn.com/problems/er-wei-shu-zu-zhong-de-cha-zhao-lcof/)
  题目提供的数据结构，从左上和右下开始寻找，都不能区分单调（那么全都递增，要么全都递减），而从左下和右上却可以通过两个寻址方向来区分两个单调方向

### 排序

- [把数组排成最小的数](https://leetcode-cn.com/problems/ba-shu-zu-pai-cheng-zui-xiao-de-shu-lcof/)
  快排，只要注意两个数组项比较时，不是按数字大小，是按字符集顺序

- [最小的 k 个数](https://leetcode-cn.com/problems/zui-xiao-de-kge-shu-lcof/)
  典型快排，也可小顶堆，不过没必要

### 其他

- [顺时针打印矩阵](https://leetcode-cn.com/problems/shun-shi-zhen-da-yin-ju-zhen-lcof/)
  每次遍历矩形的一条边，收缩对应的边界，直到边界重合未知，表示遍历结束

---

### todo

- [重建二叉树](https://leetcode-cn.com/problems/zhong-jian-er-cha-shu-lcof/)

- [二叉搜索树与双向链表](https://leetcode-cn.com/problems/er-cha-sou-suo-shu-yu-shuang-xiang-lian-biao-lcof/)
