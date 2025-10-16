import React, { useState } from 'react';
import '../assets/ContactForm.css';

interface FormData { // 定义FormData接口，约束表单数据结构，通过静态类型检查避免因类型错误导致的bug
    name: string;
    email: string;
    message: string;
}

const ContactForm: React.FC = () => { // 定义ContactForm组件，类型为 function component
    // 使用useState创建状态，并初始化为空对象，定义了三种状态
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        message: ''
    }); // formData状态，存储表单数据

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // 创建isSubmitting状态，用于指示表单是否提交
    const [submitStatus, setSubmitStatus] = useState<string>(''); // 创建submitStatus状态，用于指示提交结果

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }; // 输入变化实时更新到formData状态

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 避免传统表单提交导致的页面刷新
        setIsSubmitting(true); // 禁用按钮防止重复提交
        setSubmitStatus(''); // 清空之前的提交结果

        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('表单数据:', formData);
            setSubmitStatus('success'); // 设置提交结果为成功
            setFormData({ name: '', email: '', message: '' }); // 重置表单数据
        } catch (error) {
            console.error('提交失败:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="contact-form-section">
            <div className="contact-container">
                <div className="contact-header">
                    <h2>联系我们</h2>
                    <p>有任何问题或建议，请随时与我们联系</p>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">姓名</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="请输入您的姓名"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">邮箱</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="请输入您的邮箱地址"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">留言</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            placeholder="请输入您的留言内容"
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '提交中...' : '发送消息'}
                    </button>

                    {submitStatus === 'success' && (
                        <div className="status-message success">
                            消息发送成功！我们会尽快回复您。
                        </div>
                    )}

                    {submitStatus === 'error' && (
                        <div className="status-message error">
                            发送失败，请稍后重试。
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
};

export default ContactForm;