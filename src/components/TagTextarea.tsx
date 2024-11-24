import React, { useState, FC, useRef } from 'react';


interface InputTagProps {
    // value: string;
    // setComments: any;
    // setCommentsText: any;
    // atUserIds: any;
    // setAtUserIds: any;
    // // myFormRef: any;
    // setFileList: any;
    randomKey?: any;
}

// 字数限制
const wordLimit = 500;

const TagTextarea: FC<InputTagProps> = () => {
    // const query = localStorage;
    const myRef = useRef<HTMLDivElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteing, setIsDeleting] = useState(false);
    const language = localStorage.getItem('language') || 'en-US';
    const [inputLength, setInputLength] = useState(0);
    const [currentNode, setCurrentNode] = useState<any>();
    const [tagTextAreaId] = useState(`text-random123`)

    // useEffect(() => {
    //     if (!value && myRef.current) {
    //         console.log(value, '清空');
    //         myRef.current.innerText = ''; // 清空输入框内容
    //         setInputLength(0)
    //         setFileList([])
    //     }
    // }, [value]);

    const handleClick = (e: any) => {
        setIsEditing(true);
    };

    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
        const innerText = myRef.current?.innerText || '';
        if (innerText.length <= wordLimit && !isDeleteing) {
            setInputLength(innerText.length);
        }
        const { node } = getDivPosition(event.target);
        setCurrentNode(node);
    };

    const getDivPosition = (element: any) => {
        var caretOffset = 0;
        let nodeLen = 0;
        let node;

        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection !== "undefined") {
            //谷歌、火狐
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                //选中的区域
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange(); //克隆一个选中区域
                preCaretRange.selectNodeContents(element); //设置选中区域的节点内容为当前节点
                preCaretRange.setEnd(range.endContainer, range.endOffset); //重置选中区域的结束位置
                const selectNodes = preCaretRange.cloneContents().childNodes;
                node = range.endContainer;
                selectNodes.forEach((item: any) => {
                    if (item.nodeType === 3) {
                        nodeLen += item.length;
                    } else {
                        nodeLen += 1;
                    }
                });
                caretOffset = preCaretRange.toString().length;
            }
        } else if ((sel = doc.selection) && sel.type !== "Control") {
            //IE
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);

        }

        return { nodeLen, caretOffset, node };
    };
    // 模拟aite选择万人
    const handelSelect = (user: any) => {
        // 如果已经到限制成都，禁止插入
        if (inputLength >= wordLimit) {
            return;
        }
        if (user) {
            let userName = language === 'zh-CN' ? user.nameCh : user.nameEn || user.nameCh
            // 多留一个字符给最后一个空格
            userName = userName.substring(0, wordLimit - inputLength - 1);
            const range = document.createRange();
            const selection = window.getSelection();
            const start = currentNode.nodeValue.lastIndexOf("@");
            currentNode.data = `${currentNode.nodeValue}`
            // 设置选择范围
            range.setStart(currentNode, start);
            range.setEnd(currentNode, start + 1);
            // 创建新的 span 元素
            const replacementElement = document.createElement("span");
            replacementElement.textContent = `@${userName}`;
            replacementElement.style.color = "#085FE1";
            replacementElement.className = 'at-user'
            replacementElement.setAttribute('contentEditable', 'false');
            replacementElement.setAttribute('userId', user.domainNo);
            replacementElement.setAttribute('userName', user.nameCh);
            replacementElement.setAttribute('userNameEn', user.nameEn);
            replacementElement.id = user.domainNo
            let spaceNode = document.createTextNode(` `);
            // 删除选中的文本
            range.deleteContents();
            // 插入新的元素
            range.insertNode(spaceNode);
            range.insertNode(replacementElement);
            // 在替换后的元素后放置光标
            range.setStartAfter(spaceNode);
            // range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
            setInputLength(inputLength + userName.length + 1);
            setIsEditing(true)
        }
    }


    const onKeyDown = (e: any) => {
        const innerText = myRef.current?.innerText || '';
        if ((e.keyCode === 8 || e.keyCode === 46)) {
            setIsDeleting(true)
            setInputLength(innerText.length);
        } else if (innerText.length >= wordLimit) {
            setIsDeleting(false)
            // 阻止单个输入超过的时候
            // at的时候会单独截取长度，所以这里只要截取最后一个元素的长度
            const nodes = myRef.current!.childNodes;
            if (nodes && nodes.length > 0) {
                const node = nodes[nodes.length - 1];
                const leaveLength = node.textContent?.length || 0 - (innerText.length - wordLimit)
                nodes[nodes.length - 1].textContent = nodes[nodes.length - 1].textContent?.substring(0, leaveLength) || '';
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(myRef.current!);
                range.collapse(false); // 将光标放在最后
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
            setInputLength(wordLimit);
            // 阻止默认事件
            e.preventDefault();
            return false;
        } else if (e.keyCode === 50 && e.key === '@') {
            setIsDeleting(false)
            // 直接到选择完
            setIsEditing(false)
            handelSelect({domainNo: 'zhangsan123', nameEn: 'Zhang San', nameZh: '章三'})
        } else {
            setIsDeleting(false)
        }
    }

    const handelOnBlur = () => {
        // 确保提交时有所有的元素
        if (myRef.current) {
            // setComments(myRef.current?.innerHTML);
            console.log(myRef.current?.innerHTML)
            let commentText = ''
            const userIds: any[] = [];
            myRef.current.childNodes.forEach((node: any) => {
                // console.log(node.nodeType, node.textContent)
                if (node.nodeType === 3) {
                    commentText += node.textContent;
                } else if (node.nodeType === 1) {
                    userIds.push(node.id)
                }
            })
            // setCommentsText(commentText);
            console.log(commentText)
            // setAtUserIds(userIds);
            console.log(userIds)
        }
    }

    return (
        <>
            <div
                ref={myRef}
                style={{
                    borderRadius: '4px',
                    padding: '8px',
                    cursor: isEditing ? 'text' : 'pointer',
                    position: 'relative',
                }}
                id={tagTextAreaId}
                className='tag-textarea'
                onClick={handleClick}
                onInput={handleInput}
                // onKeyUp={handelKeyUp}
                onKeyDown={onKeyDown}
                onBlur={handelOnBlur}
                contentEditable="true"
                data-placeholder="请输入内容"
                data-node="true"
            >
            </div>
            
        </>
    );
};
export default TagTextarea;