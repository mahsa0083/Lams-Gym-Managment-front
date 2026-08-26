const Total = (props: { total: number }) => {
    const { total } = props
    return (
        <div className="pagination-total">
            کل <span>{total}</span> آیتم
        </div>
    )
}

export default Total
